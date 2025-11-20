
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { generatePageFromScenes } from '../../features/pageThunks';
import { Wand2Icon } from '../Icons';
import { Scene } from '../../types';

// --- Hook and Context for Component Logic ---

interface PageComposerContextType {
  activeChapter: ReturnType<typeof useAppSelector>['project']['present']['project']['chapters'][0];
  scenes: Scene[];
  selectedSceneIndices: number[];
  handleSceneToggle: (index: number) => void;
  handleGeneratePage: () => void;
}

const PageComposerContext = React.createContext<PageComposerContextType | undefined>(undefined);

const usePageComposerContext = () => {
  const context = React.useContext(PageComposerContext);
  if (!context) {
    throw new Error('usePageComposerContext must be used within a PageComposerProvider');
  }
  return context;
};

const usePageComposer = () => {
  const dispatch = useAppDispatch();
  const { project, entities, activeContext } = useAppSelector((state) => state.project.present);
  const [selectedSceneIndices, setSelectedSceneIndices] = React.useState<number[]>([]);

  if (!project || activeContext.type !== 'page-layout') {
    return null;
  }

  const activeChapter = project.chapters[activeContext.chapterId];
  const scenes = activeChapter.scenes.map(sceneId => entities.scenes[sceneId]);

  const handleSceneToggle = React.useCallback((index: number) => {
    setSelectedSceneIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  }, []);

  const handleGeneratePage = () => {
    if (selectedSceneIndices.length === 0) return;
    dispatch(generatePageFromScenes({
      chapterIndex: activeContext.chapterId,
      sceneIndices: selectedSceneIndices,
    }));
  };

  return { activeChapter, scenes, selectedSceneIndices, handleSceneToggle, handleGeneratePage };
};

// --- UI Components ---

const SceneSelectorCard: React.FC<{ 
    scene: Scene; 
    index: number;
    isSelected: boolean;
    onToggle: (index: number) => void;
}> = React.memo(({ scene, index, isSelected, onToggle }) => {
  const { t } = useTranslation();

  // Calculate intensity color based on action score
  const getIntensityColor = (score: number) => {
    if (score >= 8) return 'bg-red-500';
    if (score >= 5) return 'bg-yellow-400';
    return 'bg-blue-400';
  };

  const intensityColor = getIntensityColor(scene.actionScore);
  // Scale height to visual importance
  const intensityHeight = `${Math.max(20, scene.actionScore * 10)}%`;

  return (
    <div
      onClick={() => onToggle(index)}
      className={`pl-3 rounded-md cursor-pointer transition-all border-2 relative overflow-hidden group ${
        isSelected
          ? 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-500 shadow-md'
          : 'bg-white dark:bg-gray-900 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      {/* Intensity Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gray-200 dark:bg-gray-700" title={`Action Score: ${scene.actionScore}/10`}>
        <div 
            className={`w-full absolute bottom-0 transition-all duration-500 ${intensityColor}`} 
            style={{ height: intensityHeight }} 
        />
      </div>

      <div className="p-3 flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          readOnly
          className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />
        <div className="flex-grow">
          <div className="flex justify-between items-center">
              <p className="font-bold text-gray-800 dark:text-gray-200">{t('scene.title', { index: index + 1 })}</p>
              <span className={`text-[10px] font-bold px-1.5 rounded ${scene.actionScore > 7 ? 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/30' : 'text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'}`}>
                  Score: {scene.actionScore}
              </span>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-0.5">{scene.summary}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">{scene.originalText}</p>
          
          <div className="mt-2 flex flex-wrap gap-1">
              {scene.characters.map(char => (
                  <span key={char} className="text-[10px] px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">{char}</span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
});

const PageComposerContent: React.FC = () => {
  const { t } = useTranslation();
  const { activeChapter, scenes, selectedSceneIndices, handleGeneratePage, handleSceneToggle } = usePageComposerContext();

  return (
    <div className="w-full h-full p-8 overflow-y-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 flex items-center justify-center gap-3">
          <Wand2Icon className="w-8 h-8" />
          {t('pageLayout.title')}
        </h2>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-2">{activeChapter.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-xl mx-auto">{t('pageLayout.subtitle')}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold mb-4 flex items-center justify-between">
                {t('pageLayout.selectScenes')}
                <span className="text-xs font-normal text-gray-500 bg-white dark:bg-gray-900 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                    {scenes.length} Available
                </span>
            </h4>
            <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto pr-2">
            {scenes.length > 0 ? (
                scenes.map((scene, index) => (
                    <SceneSelectorCard 
                        key={index} 
                        scene={scene} 
                        index={index}
                        isSelected={selectedSceneIndices.includes(index)}
                        onToggle={handleSceneToggle}
                    />
                ))
            ) : (
                <p className="text-gray-500 text-center py-10">{t('pageLayout.noScenes')}</p>
            )}
            </div>
          </div>

          <div className="lg:col-span-1">
               <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 sticky top-4 shadow-lg">
                   <h4 className="font-bold text-lg mb-4">Page Preview</h4>
                   <div className="aspect-[11/16] w-full bg-gray-100 dark:bg-gray-900 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center p-4 text-center">
                       {selectedSceneIndices.length === 0 ? (
                           <p className="text-gray-400 text-sm">Select scenes to see layout estimate</p>
                       ) : (
                           <div className="w-full h-full flex flex-col gap-1">
                               {selectedSceneIndices.map((idx, i) => {
                                   const scene = scenes[idx];
                                   const totalScore = selectedSceneIndices.reduce((acc, curr) => acc + scenes[curr].actionScore, 0);
                                   const heightPercent = (scene.actionScore / totalScore) * 100;
                                   const colorClass = scene.actionScore > 7 ? 'bg-red-200 dark:bg-red-900/60 border-red-400' : scene.actionScore > 4 ? 'bg-yellow-200 dark:bg-yellow-900/60 border-yellow-400' : 'bg-blue-200 dark:bg-blue-900/60 border-blue-400';
                                   
                                   return (
                                       <div key={i} className={`${colorClass} border rounded flex items-center justify-center text-[10px] font-bold text-gray-800 dark:text-gray-200 overflow-hidden relative`} style={{ height: `${heightPercent}%`}}>
                                           <span className="z-10">Scene {idx + 1}</span>
                                       </div>
                                   )
                               })}
                           </div>
                       )}
                   </div>
                    <div className="mt-6">
                         <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center">
                             {selectedSceneIndices.length} scenes selected
                         </p>
                        <button
                        onClick={handleGeneratePage}
                        disabled={selectedSceneIndices.length === 0}
                        className="w-full py-3 px-6 bg-indigo-600 rounded-lg text-lg font-bold text-white transition-all duration-300 shadow-lg hover:bg-indigo-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed hover:shadow-indigo-500/30"
                        >
                        {t('pageLayout.generatePage', { count: selectedSceneIndices.length })}
                        </button>
                    </div>
               </div>
          </div>
      </div>
    </div>
  );
};

const PageComposerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = usePageComposer();
  if (!value) return <div>Error: No active chapter selected for layout.</div>;
  return <PageComposerContext.Provider value={value}>{children}</PageComposerContext.Provider>;
};

const PageComposer: React.FC = () => {
  return (
    <PageComposerProvider>
      <PageComposerContent />
    </PageComposerProvider>
  );
};

export default PageComposer;
