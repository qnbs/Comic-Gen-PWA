import React from 'react';
import type {
  ComicBookPage,
  PanelData,
  AppSettings,
  SpeechBubbleSettings,
} from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { RefreshCwIcon, MoveIcon, VideoIcon, SpeakerWaveIcon, LoaderIcon } from './Icons';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { updatePanelDialogue, updatePanelLayout, generateSpeechForPanel, generatePanelVideo } from '../features/generationSlice';
import { addToast } from '../features/uiSlice';
import RegeneratePanelModal from './RegeneratePanelModal';
import { hexToRgb } from '../services/utils';
import { decode, decodeAudioData } from '../services/audioUtils';

interface SpeechBubbleProps {
  panel: PanelData;
  x: number;
  y: number;
  width: number;
  settings: SpeechBubbleSettings;
  onDialogueChange: (newDialogue: string) => void;
  isGeneratingAudio: boolean;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = React.memo(
  ({ panel, x, y, width, settings, onDialogueChange, isGeneratingAudio }) => {
    const {
      fontSize,
      fontFamily,
      style,
      backgroundColor,
      textColor,
      opacity,
    } = settings;
    const [isEditing, setIsEditing] = React.useState(false);
    const [editedText, setEditedText] = React.useState(panel.dialogue);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const dispatch = useAppDispatch();
    const audioContextRef = React.useRef<AudioContext | null>(null);

    React.useEffect(() => {
      if (isEditing && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [isEditing]);

    const playAudio = async (url: string) => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioContext = audioContextRef.current;
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBytes = new Uint8Array(arrayBuffer);
            const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.start();
        } catch (error) {
            console.error("Failed to play audio:", error);
        }
    };
    
    // Play audio when URL becomes available after generation
    React.useEffect(() => {
      if (panel.audioUrl && isGeneratingAudio) {
        playAudio(panel.audioUrl);
      }
    }, [panel.audioUrl, isGeneratingAudio]);

    const handleBubbleClick = () => {
        if (isEditing) return;
        if (panel.audioUrl) {
            playAudio(panel.audioUrl);
        } else if (!isGeneratingAudio) {
            dispatch(generateSpeechForPanel({ panelId: panel.id, text: panel.dialogue }));
        }
    };

    if (!panel.dialogue || panel.dialogue.trim() === '') return null;

    const bubbleClasses = React.useMemo(() => {
      switch (style) {
        case 'cloud':
          return 'rounded-2xl border-2 border-dashed border-gray-400';
        case 'sharp':
          return 'rounded-none';
        case 'rounded':
        default:
          return 'rounded-lg';
      }
    }, [style]);

    const handleSave = () => {
      if (editedText !== panel.dialogue) {
        onDialogueChange(editedText);
      }
      setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        setEditedText(panel.dialogue);
        setIsEditing(false);
      }
    };

    const handleTextareaChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
      setEditedText(e.target.value);
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const tailRgb = hexToRgb(backgroundColor);
    const bgRgb = hexToRgb(backgroundColor);

    return (
      <div
        className={`absolute p-2 shadow-md ${bubbleClasses} transition-transform duration-300 hover:scale-105 cursor-pointer`}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          maxWidth: `${width - 16}px`,
          transform: 'translate(-50%, -100%)',
          transformOrigin: 'bottom center',
          backgroundColor: bgRgb
            ? `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, ${opacity})`
            : 'rgba(255, 255, 255, 0.9)',
          color: textColor,
        }}
        onClick={handleBubbleClick}
        onDoubleClick={() => !isEditing && setIsEditing(true)}
      >
        <div className="flex items-start gap-2">
            <div className="flex-grow">
                {isEditing ? (
                  <textarea
                    ref={textareaRef}
                    value={editedText}
                    onChange={handleTextareaChange}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    style={{ fontSize: `${fontSize}px`, fontFamily: fontFamily }}
                    className="bg-transparent border-none focus:outline-none focus:ring-0 resize-none w-full overflow-hidden"
                  />
                ) : (
                  <p
                    style={{
                      hyphens: 'auto',
                      fontSize: `${fontSize}px`,
                      fontFamily: fontFamily,
                    }}
                  >
                    {panel.dialogue}
                  </p>
                )}
            </div>
            {isGeneratingAudio ? (
                <LoaderIcon className="w-4 h-4 animate-spin flex-shrink-0" />
            ) : (
                <SpeakerWaveIcon className="w-4 h-4 opacity-50 flex-shrink-0" />
            )}
        </div>
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent"
          style={{
            borderTop: tailRgb
              ? `8px solid rgba(${tailRgb.r}, ${tailRgb.g}, ${tailRgb.b}, ${opacity})`
              : '8px solid white',
          }}
        ></div>
      </div>
    );
  },
);

interface PanelProps {
  panel: PanelData;
  bubblePosition?: { x: number; y: number };
  showSpeechBubbles: boolean;
  speechBubbleSettings: SpeechBubbleSettings;
  onRegenerateClick: (panel: PanelData) => void;
  isRegenerating: boolean;
  isVideoGenerating: boolean;
  isAudioGenerating: boolean;
  pageNumber: number;
}

const Panel: React.FC<PanelProps> = React.memo(
  ({
    panel,
    bubblePosition,
    showSpeechBubbles,
    speechBubbleSettings,
    onRegenerateClick,
    isRegenerating,
    isVideoGenerating,
    isAudioGenerating,
    pageNumber,
  }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const panelRef = React.useRef<HTMLDivElement>(null);
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { aspectRatio } = useAppSelector(state => state.settings.generation);

    const [currentLayout, setCurrentLayout] = React.useState({
      x: panel.x,
      y: panel.y,
      width: panel.width,
      height: panel.height,
    });

    const interactionRef = React.useRef<{
      type: 'move' | 'resize';
      startX: number;
      startY: number;
      startPanelX: number;
      startPanelY: number;
      startPanelWidth: number;
      startPanelHeight: number;
    } | null>(null);

    React.useEffect(() => {
        setCurrentLayout({
            x: panel.x,
            y: panel.y,
            width: panel.width,
            height: panel.height,
        });
    }, [panel.x, panel.y, panel.width, panel.height]);

    const handleInteractionStart = (e: React.MouseEvent<HTMLDivElement>, type: 'move' | 'resize') => {
        e.preventDefault();
        e.stopPropagation();

        interactionRef.current = {
            type,
            startX: e.clientX,
            startY: e.clientY,
            startPanelX: currentLayout.x,
            startPanelY: currentLayout.y,
            startPanelWidth: currentLayout.width,
            startPanelHeight: currentLayout.height,
        };
        document.body.style.cursor = type === 'move' ? 'move' : 'nwse-resize';
        document.body.style.userSelect = 'none';

        window.addEventListener('mousemove', handleInteractionMove);
        window.addEventListener('mouseup', handleInteractionEnd);
    };

    const handleInteractionMove = (e: MouseEvent) => {
        if (!interactionRef.current) return;
        
        const deltaX = e.clientX - interactionRef.current.startX;
        const deltaY = e.clientY - interactionRef.current.startY;

        if (interactionRef.current.type === 'move') {
            setCurrentLayout(prev => ({
                ...prev,
                x: interactionRef.current!.startPanelX + deltaX,
                y: interactionRef.current!.startPanelY + deltaY,
            }));
        } else { // resize
            setCurrentLayout(prev => ({
                ...prev,
                width: Math.max(100, interactionRef.current!.startPanelWidth + deltaX),
                height: Math.max(100, interactionRef.current!.startPanelHeight + deltaY),
            }));
        }
    };
    
    const handleInteractionEnd = () => {
        window.removeEventListener('mousemove', handleInteractionMove);
        window.removeEventListener('mouseup', handleInteractionEnd);
        
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';

        setCurrentLayout(latestLayout => {
            dispatch(updatePanelLayout({ pageNumber, panelId: panel.id, layout: latestLayout }));
            return latestLayout;
        });
        
        interactionRef.current = null;
    };

    const handleGenerateVideo = async () => {
        if (!window.confirm("Generating a video panel uses the Veo model, which is a paid feature that may take several minutes. Do you want to continue? For billing information, visit ai.google.dev/gemini-api/docs/billing")) {
            return;
        }
        try {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    await window.aistudio.openSelectKey();
                }
            }
            dispatch(generatePanelVideo({ panelId: panel.id, prompt: panel.originalVisualPrompt }));
        } catch (e) {
            console.error("API Key selection error:", e);
            dispatch(addToast({ type: 'info', message: 'API Key selection is required for video generation.' }));
        }
    };

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        },
        { rootMargin: '300px 0px 300px 0px' },
      );

      const currentRef = panelRef.current;
      if (currentRef) {
        observer.observe(currentRef);
      }

      return () => {
        if (currentRef) {
          observer.unobserve(currentRef);
        }
      };
    }, []);

    const altText = React.useMemo(() => {
      if (panel.dialogue && panel.dialogue.trim() !== '') {
        return `${t('comic.panelAltWithDialogue')}: "${panel.dialogue}"`;
      }
      return t('comic.panelAlt');
    }, [panel.dialogue, t]);

    const handleDialogueChange = React.useCallback(
      (newDialogue: string) => {
        dispatch(updatePanelDialogue({ pageNumber, panelId: panel.id, newDialogue }));
      },
      [dispatch, panel.id, pageNumber],
    );

    const isLoading = isRegenerating || isVideoGenerating;

    return (
      <div
        ref={panelRef}
        className="absolute bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg group"
        style={{
          left: `${currentLayout.x}px`,
          top: `${currentLayout.y}px`,
          width: `${currentLayout.width}px`,
          height: `${currentLayout.height}px`,
          transition: interactionRef.current ? 'none' : 'all 0.2s ease-in-out',
        }}
      >
        {isVisible && panel.videoUrl ? (
            <video
                src={panel.videoUrl}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
            />
        ) : isVisible ? (
          <img
            src={panel.imageUrl}
            alt={altText}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-600 animate-pulse" />
        )}

        {isVisible && showSpeechBubbles && bubblePosition && (
          <SpeechBubble
            panel={panel}
            x={bubblePosition.x}
            y={bubblePosition.y}
            width={currentLayout.width * 0.8}
            settings={speechBubbleSettings}
            onDialogueChange={handleDialogueChange}
            isGeneratingAudio={isAudioGenerating}
          />
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-4 text-center">
            <div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin mb-4"></div>
            <p className="font-semibold">{isRegenerating ? "Regenerating Image..." : "Generating Video..."}</p>
            {isVideoGenerating && <p className="text-sm mt-2">This can take several minutes. Please be patient.</p>}
          </div>
        )}
        {!isLoading && (
          <>
            <div
                className="panel-handle panel-move-handle"
                onMouseDown={(e) => handleInteractionStart(e, 'move')}
                title="Move Panel"
            >
                <MoveIcon className="w-5 h-5 text-gray-800" />
            </div>
            <div
                className="panel-handle panel-resize-handle"
                onMouseDown={(e) => handleInteractionStart(e, 'resize')}
                title="Resize Panel"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none gap-2">
              <button
                onClick={() => onRegenerateClick(panel)}
                className="p-3 bg-white/80 text-gray-900 rounded-full hover:bg-white backdrop-blur-sm transition-transform hover:scale-110 pointer-events-auto"
                aria-label={t('comic.regeneratePanelAria')}
              >
                <RefreshCwIcon className="w-6 h-6" />
              </button>
              <button
                onClick={handleGenerateVideo}
                className="p-3 bg-white/80 text-gray-900 rounded-full hover:bg-white backdrop-blur-sm transition-transform hover:scale-110 pointer-events-auto"
                aria-label="Generate Video Panel"
              >
                <VideoIcon className="w-6 h-6" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  },
);

interface ComicPageProps {
  page: ComicBookPage;
  settings: AppSettings;
  scale: number;
}

const ComicPage = React.forwardRef<HTMLDivElement, ComicPageProps>(
  ({ page, settings, scale }, ref) => {
    const [bubblePositions, setBubblePositions] = React.useState<
      Record<string, { x: number; y: number }>
    >({});
    const [panelToRegenerate, setPanelToRegenerate] =
      React.useState<PanelData | null>(null);

    const { t } = useTranslation();
    const { panelRegenerationStatus, panelVideoGenerationStatus, panelAudioGenerationStatus } = useAppSelector(
      (state) => state.generation,
    );

    const panelsWithDialogue = React.useMemo(
      () => page.panels.filter((p) => p.dialogue && p.dialogue.trim() !== ''),
      [page.panels],
    );

    React.useEffect(() => {
      const urls = page.panels.flatMap((p) => [p.imageUrl, p.videoUrl, p.audioUrl].filter(Boolean) as string[]);
      return () => {
        urls.forEach((url) => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      };
    }, [page]);
    
    React.useEffect(() => {
      if (panelsWithDialogue.length === 0) {
        setBubblePositions({});
        return;
      }

      // Create a new web worker to run the D3 simulation off the main thread.
      // This prevents UI jank on pages with many dialogue bubbles.
      const worker = new Worker(new URL('../services/speechBubbleWorker.ts', import.meta.url), {
        type: 'module',
      });

      // Listen for the final calculated positions from the worker.
      worker.onmessage = (event: MessageEvent<Record<string, { x: number; y: number }>>) => {
        setBubblePositions(event.data);
      };
      
      worker.onerror = (error) => {
          console.error('Speech bubble worker error:', error);
          // Optional: Implement a fallback to an on-thread method if the worker fails.
      };

      // Send only the necessary data to the worker to minimize data transfer.
      const panelDataForWorker = panelsWithDialogue.map(p => ({
          id: p.id,
          x: p.x,
          y: p.y,
          width: p.width,
          height: p.height,
      }));

      worker.postMessage({ panelsWithDialogue: panelDataForWorker });

      // Terminate the worker when the component unmounts or dependencies change.
      return () => {
        worker.terminate();
      };
    }, [panelsWithDialogue]);


    const { showSpeechBubbles, speechBubbles, generation } = settings;
    const { pageBorder } = generation;

    const handleRegenerateSuccess = () => {
      setPanelToRegenerate(null);
    };

    return (
      <>
        <div
          ref={ref}
          className="bg-white dark:bg-gray-800 shadow-2xl relative"
          style={{
            width: '1100px',
            height: '1600px',
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            border: pageBorder.enabled
              ? `10px solid ${pageBorder.color}`
              : 'none',
            boxSizing: 'border-box',
          }}
        >
          <div className="md:hidden absolute -top-16 left-1/2 -translate-x-1/2 bg-yellow-200 text-black p-2 rounded-md text-center w-64 text-xs font-semibold">
            {t('comic.mobileHint')}
          </div>
          {page.panels.map((panel) => (
            <Panel
              key={panel.id}
              panel={panel}
              bubblePosition={bubblePositions[panel.id]}
              showSpeechBubbles={showSpeechBubbles}
              speechBubbleSettings={speechBubbles}
              onRegenerateClick={setPanelToRegenerate}
              isRegenerating={panelRegenerationStatus[panel.id] === 'loading'}
              isVideoGenerating={panelVideoGenerationStatus[panel.id] === 'loading'}
              isAudioGenerating={panelAudioGenerationStatus[panel.id] === 'loading'}
              pageNumber={page.pageNumber}
            />
          ))}
        </div>
        {panelToRegenerate && (
          <RegeneratePanelModal
            panel={panelToRegenerate}
            onClose={() => setPanelToRegenerate(null)}
            onSuccess={handleRegenerateSuccess}
          />
        )}
      </>
    );
  },
);

export default ComicPage;