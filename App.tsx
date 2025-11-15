
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { hierarchy, treemap, treemapSquarify, treemapSliceDice, treemapBinary } from 'd3-hierarchy';
import JSZip from 'jszip';
import { GenerationState, ComicPageData, Scene, Character, AppSettings, SavedProgress } from './types';
import { analyzeBookText, generatePanelImage } from './services/geminiService';
import { saveComic, clearAllComics } from './services/db';
import BookImporter from './components/BookImporter';
import Loader from './components/Loader';
import ComicPage from './components/ComicPage';
import CharacterDefinition from './components/CharacterDefinition';
import SettingsPanel from './components/SettingsPanel';
import SceneReview from './components/SceneReview';
import SettingsPage from './components/SettingsPage';
import HelpPage from './components/HelpPage';
import { BookOpenIcon, SparklesIcon, CogIcon, DownloadIcon, PdfIcon, HelpCircleIcon } from './components/Icons';
import { useTranslation } from './hooks/useTranslation';

const SAVED_PROGRESS_KEY = 'comicGenProgress';
const APP_THEME_KEY = 'comicGenTheme';

type Page = 'creator' | 'settings' | 'help';
type Theme = 'light' | 'dark';

const loadProgress = (): SavedProgress | null => {
    try {
        const saved = localStorage.getItem(SAVED_PROGRESS_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            if (data.generationState && data.sceneHistory) {
                return data;
            }
        }
    } catch (e) {
        console.error("Failed to load progress", e);
        localStorage.removeItem(SAVED_PROGRESS_KEY);
    }
    return null;
};

const getInitialTheme = (): Theme => {
    const savedTheme = localStorage.getItem(APP_THEME_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
};


const App: React.FC = () => {
  const [generationState, setGenerationState] = useState<GenerationState>(GenerationState.IDLE);
  const [currentPage, setCurrentPage] = useState<Page>('creator');
  const [theme, setTheme] = useState<Theme>(getInitialTheme());

  const [comicPage, setComicPage] = useState<ComicPageData | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [originalText, setOriginalText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [comicSettings, setComicSettings] = useState<AppSettings>({
    showSpeechBubbles: true,
    layoutAlgorithm: 'squarified',
    speechBubbleFontSize: 16,
    speechBubbleFontFamily: "'Bangers', cursive",
    imageQuality: 'high',
    aspectRatio: '1:1',
  });
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const comicPageRef = useRef<HTMLDivElement>(null);

  const [sceneHistory, setSceneHistory] = useState<Scene[][]>([]);
  const [sceneHistoryIndex, setSceneHistoryIndex] = useState(-1);
  const currentScenes = sceneHistory[sceneHistoryIndex] || [];
  const canUndoScene = sceneHistoryIndex > 0;
  const canRedoScene = sceneHistoryIndex < sceneHistory.length - 1;

  const [characterHistory, setCharacterHistory] = useState<Character[][]>([]);
  const [characterHistoryIndex, setCharacterHistoryIndex] = useState(-1);
  const currentCharacters = characterHistory[characterHistoryIndex] || [];
  const canUndoCharacter = characterHistoryIndex > 0;
  const canRedoCharacter = characterHistoryIndex < characterHistory.length - 1;
  
  const { t, language } = useTranslation();
  
  const [savedProgress, setSavedProgress] = useState<SavedProgress | null>(loadProgress());

  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(APP_THEME_KEY, theme);
  }, [theme]);

  const saveProgress = useCallback(() => {
    if (generationState === GenerationState.REVIEW_SCENES || generationState === GenerationState.CHARACTER_DEFINITION) {
        const progress: SavedProgress = {
            generationState,
            originalText,
            scenes: currentScenes,
            sceneHistory,
            sceneHistoryIndex,
            characterHistory,
            characterHistoryIndex,
            timestamp: Date.now(),
        };
        localStorage.setItem(SAVED_PROGRESS_KEY, JSON.stringify(progress));
        setSavedProgress(progress);
    }
  }, [generationState, originalText, currentScenes, sceneHistory, sceneHistoryIndex, characterHistory, characterHistoryIndex]);

  useEffect(() => {
      const timer = setTimeout(() => {
        saveProgress();
      }, 500);
      return () => clearTimeout(timer);
  }, [sceneHistory, characterHistory, generationState, saveProgress]);
  
  const resumeSession = () => {
      if (savedProgress) {
          setGenerationState(savedProgress.generationState);
          setOriginalText(savedProgress.originalText);
          setScenes(savedProgress.scenes);
          setSceneHistory(savedProgress.sceneHistory);
          setSceneHistoryIndex(savedProgress.sceneHistoryIndex);
          setCharacterHistory(savedProgress.characterHistory);
          setCharacterHistoryIndex(savedProgress.characterHistoryIndex);
          setSavedProgress(null);
          setCurrentPage('creator');
      }
  };

  const startAnalysis = useCallback(async (bookText: string) => {
    setGenerationState(GenerationState.ANALYZING_TEXT);
    setError(null);
    setComicPage(null);
    setOriginalText(bookText);
    setSavedProgress(null);
    localStorage.removeItem(SAVED_PROGRESS_KEY);

    try {
      const analyzedScenes = await analyzeBookText(bookText, language);
      if (!analyzedScenes || analyzedScenes.length === 0) {
        throw new Error(t('error.noScenesExtracted'));
      }
      setSceneHistory([analyzedScenes]);
      setSceneHistoryIndex(0);
      setGenerationState(GenerationState.REVIEW_SCENES);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('error.unknownAnalysis'));
      setGenerationState(GenerationState.ERROR);
    }
  }, [t, language]);

  const handleUpdateScene = (index: number, updatedScene: Scene) => {
      const newScenes = [...currentScenes];
      newScenes[index] = updatedScene;
      const newHistory = sceneHistory.slice(0, sceneHistoryIndex + 1);
      newHistory.push(newScenes);
      setSceneHistory(newHistory);
      setSceneHistoryIndex(newHistory.length - 1);
  };
  
  const undoSceneChange = () => { if (canUndoScene) setSceneHistoryIndex(i => i - 1); };
  const redoSceneChange = () => { if (canRedoScene) setSceneHistoryIndex(i => i + 1); };

  const handleScenesReviewed = (updatedScenes: Scene[]) => {
    setScenes(updatedScenes);
    const characterNames = [...new Set(updatedScenes.flatMap(s => s.characters))];
    const initialCharacters: Character[] = characterNames.map(name => ({
      name,
      description: '',
      referenceImageUrl: null,
    }));
    setCharacterHistory([initialCharacters]);
    setCharacterHistoryIndex(0);
    setGenerationState(GenerationState.CHARACTER_DEFINITION);
  };

  const handleCharacterSheetGenerated = (characterName: string, description: string, imageUrl: string) => {
    const newCharacters = currentCharacters.map(c => 
        c.name === characterName ? { ...c, description, referenceImageUrl: imageUrl } : c
    );
    const newHistory = characterHistory.slice(0, characterHistoryIndex + 1);
    newHistory.push(newCharacters);
    setCharacterHistory(newHistory);
    setCharacterHistoryIndex(newHistory.length - 1);
  };

  const undoCharacterChange = () => { if (canUndoCharacter) setCharacterHistoryIndex(i => i - 1); };
  const redoCharacterChange = () => { if (canRedoCharacter) setCharacterHistoryIndex(i => i + 1); };

  const generateComic = useCallback(async () => {
    setGenerationState(GenerationState.GENERATING_IMAGES);
    localStorage.removeItem(SAVED_PROGRESS_KEY);
    
    try {
      const imageGenerationPromises = scenes.map(scene => {
        let characterDescriptions = '';
        scene.characters.forEach(charName => {
            const characterData = currentCharacters.find(c => c.name === charName);
            if (characterData?.description) {
                characterDescriptions += `\n- ${charName}: ${characterData.description}`;
            }
        });

        let promptWithCharacterConsistency = scene.visualPrompt;
        if (characterDescriptions) {
            promptWithCharacterConsistency += `\n\n--- ${t('gemini.characterReference').toUpperCase()} ---\n${characterDescriptions}\n${t('gemini.characterAdherence')}`;
        }
        return generatePanelImage(promptWithCharacterConsistency, comicSettings.imageQuality, comicSettings.aspectRatio);
      });

      const base64Images = await Promise.all(imageGenerationPromises);

      setGenerationState(GenerationState.COMPOSING);

      const root = hierarchy({ name: 'root', children: scenes })
        .sum(d => (d as Scene).actionScore || 1)
        .sort((a, b) => ((b.value ?? 0) - (a.value ?? 0)));

      const treemapLayout = treemap<Scene>().size([1100, 1600]).padding(20);

      if (comicSettings.layoutAlgorithm === 'strip') {
          treemapLayout.tile(treemapSliceDice);
      } else if (comicSettings.layoutAlgorithm === 'binary') {
          treemapLayout.tile(treemapBinary);
      } else {
          treemapLayout.tile(treemapSquarify);
      }
      
      treemapLayout(root);

      const panels = (root.leaves() as any[]).map((leaf, index) => ({
        id: `panel-${index}`,
        x: leaf.x0,
        y: leaf.y0,
        width: leaf.x1 - leaf.x0,
        height: leaf.y1 - leaf.y0,
        imageUrl: `data:image/jpeg;base64,${base64Images[index]}`,
        dialogue: leaf.data.dialogue,
      }));

      const newComicPage = { panels };
      setComicPage(newComicPage);
      setGenerationState(GenerationState.DONE);

      saveComic(newComicPage, `${t('comic.titlePrefix')} ${new Date().toLocaleString()}`).catch(err => {
        console.error("Failed to save comic to IndexedDB:", err);
      });

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('error.unknownGeneration'));
      setGenerationState(GenerationState.ERROR);
    }
  }, [scenes, currentCharacters, comicSettings.layoutAlgorithm, comicSettings.imageQuality, comicSettings.aspectRatio, t]);

  const handleDownload = async () => {
    if (!comicPage || isDownloading) return;
    setIsDownloading(true);
    try {
        const zip = new JSZip();
        comicPage.panels.forEach((panel, index) => {
            const imageData = panel.imageUrl.split(',')[1];
            if (imageData) {
                zip.file(`panel-${String(index + 1).padStart(3, '0')}.jpeg`, imageData, { base64: true });
            }
        });
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        const title = originalText.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'comic';
        link.download = `${title}.cbz`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } catch(err) {
        console.error("Download failed:", err);
        setError(t('error.downloadFailed'));
    } finally { setIsDownloading(false); }
  };

  const handleExportPdf = async () => {
    if (!comicPageRef.current || isExportingPdf) return;
    setIsExportingPdf(true);
    setError(null);
    try {
        const { jsPDF } = window.jspdf;
        const canvas = await window.html2canvas(comicPageRef.current, {
            width: 1100,
            height: 1600,
            scale: 1,
            useCORS: true,
            backgroundColor: theme === 'light' ? '#ffffff' : '#111827', // Match bg
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [1100, 1600] });
        pdf.addImage(imgData, 'JPEG', 0, 0, 1100, 1600);
        const title = originalText.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'comic';
        pdf.save(`${title}.pdf`);
    } catch(err) {
        console.error("PDF Export failed:", err);
        setError(t('error.pdfExportFailed'));
    } finally { setIsExportingPdf(false); }
  };

  const resetApp = () => {
    setGenerationState(GenerationState.IDLE);
    setComicPage(null);
    setError(null);
    setScenes([]);
    setSceneHistory([]);
    setSceneHistoryIndex(-1);
    setCharacterHistory([]);
    setCharacterHistoryIndex(-1);
    setOriginalText('');
    localStorage.removeItem(SAVED_PROGRESS_KEY);
    setSavedProgress(null);
    setCurrentPage('creator');
  };

  const clearAllData = () => {
    localStorage.removeItem(SAVED_PROGRESS_KEY);
    clearAllComics().then(() => {
        resetApp();
    }).catch(e => console.error("Failed to clear comics DB", e));
  };

  const renderCreatorContent = () => {
    switch (generationState) {
      case GenerationState.IDLE:
        return <BookImporter onGenerate={startAnalysis} savedProgress={savedProgress} onResume={resumeSession} onDiscard={resetApp} />;
      case GenerationState.ANALYZING_TEXT:
      case GenerationState.GENERATING_IMAGES:
      case GenerationState.COMPOSING:
        return <Loader state={generationState} />;
      case GenerationState.REVIEW_SCENES:
        return <SceneReview scenes={currentScenes} onUpdate={handleUpdateScene} onComplete={handleScenesReviewed} onUndo={undoSceneChange} onRedo={redoSceneChange} canUndo={canUndoScene} canRedo={canRedoScene} />;
      case GenerationState.CHARACTER_DEFINITION:
        return <CharacterDefinition characters={currentCharacters} bookText={originalText} onCharacterSheetGenerated={handleCharacterSheetGenerated} onComplete={generateComic} onUndo={undoCharacterChange} onRedo={redoCharacterChange} canUndo={canUndoCharacter} canRedo={canRedoCharacter} />;
      case GenerationState.DONE:
        return comicPage ? <ComicPage ref={comicPageRef} page={comicPage} settings={comicSettings} /> : <p>{t('error.somethingWentWrong')}</p>;
      case GenerationState.ERROR:
        return (
          <div className="text-center text-red-500 dark:text-red-400">
            <h2 className="text-2xl font-bold mb-4">{t('error.generationFailed')}</h2>
            <p className="mb-6">{error}</p>
            <button onClick={resetApp} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold text-white transition-colors">
              {t('common.tryAgain')}
            </button>
          </div>
        );
      default: return null;
    }
  };

  const renderContent = () => {
    switch(currentPage) {
        case 'creator': return renderCreatorContent();
        case 'settings': return <SettingsPage theme={theme} setTheme={setTheme} clearAllData={clearAllData} onBack={() => setCurrentPage('creator')} />;
        case 'help': return <HelpPage onBack={() => setCurrentPage('creator')} />;
        default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-8">
      <header className="w-full max-w-5xl text-center mb-8 relative">
        <div className="absolute top-0 right-0 flex items-center gap-2">
            <button onClick={() => setCurrentPage('settings')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label={t('settings.title')}><CogIcon className="w-6 h-6" /></button>
            <button onClick={() => setCurrentPage('help')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label={t('helpPage.title')}><HelpCircleIcon className="w-6 h-6" /></button>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 flex items-center justify-center gap-4 cursor-pointer" onClick={() => setCurrentPage('creator')}>
          <BookOpenIcon className="w-10 h-10" />
          Comic-Gen PWA
          <SparklesIcon className="w-10 h-10" />
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          {t('app.subtitle')}
        </p>
      </header>
      
      <main className="w-full flex-grow flex items-center justify-center">
        {renderContent()}
      </main>

      {generationState === GenerationState.DONE && currentPage === 'creator' && (
         <>
            <div className="fixed bottom-4 right-4 z-20 flex flex-col gap-4 items-end">
                {isSettingsPanelOpen && <SettingsPanel settings={comicSettings} onSettingsChange={setComicSettings} />}
                <div className="flex gap-4">
                    <button onClick={handleExportPdf} disabled={isExportingPdf} className="p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-full shadow-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait" aria-label={t('comic.exportPdf')}>
                        {isExportingPdf ? <div className="w-7 h-7 border-2 border-t-transparent border-current rounded-full animate-spin"></div> : <PdfIcon className="w-7 h-7" />}
                    </button>
                    <button onClick={handleDownload} disabled={isDownloading} className="p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-full shadow-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait" aria-label={t('comic.download')}>
                        {isDownloading ? <div className="w-7 h-7 border-2 border-t-transparent border-current rounded-full animate-spin"></div> : <DownloadIcon className="w-7 h-7" />}
                    </button>
                    <button onClick={() => setIsSettingsPanelOpen(!isSettingsPanelOpen)} className="p-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-full shadow-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-transform hover:scale-105" aria-label={t('settings.title')}>
                      <CogIcon className="w-7 h-7" />
                    </button>
                    <button onClick={resetApp} className="px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-transform hover:scale-105">
                        {t('comic.createNew')}
                    </button>
                </div>
            </div>
         </>
      )}

      <footer className="w-full max-w-5xl text-center mt-8 text-gray-500 dark:text-gray-500 text-sm">
        <p>{t('app.footer')}</p>
      </footer>
    </div>
  );
};

export default App;