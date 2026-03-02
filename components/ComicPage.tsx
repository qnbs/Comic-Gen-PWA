import React from 'react';
import type {
  ComicBookPage,
  PanelData,
  AppSettings,
  SpeechBubbleSettings,
} from '../types';
import { useTranslation } from '../hooks/useTranslation';
import {
  RefreshCwIcon,
  MoveIcon,
  VideoIcon,
  SpeakerWaveIcon,
  LoaderIcon,
} from './Icons';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  updatePanelDialogue,
  updatePanelLayout,
} from '../features/projectSlice';
import {
  generateSpeechForPanel,
  generatePanelVideo,
} from '../features/pageThunks';
import { addToast } from '../features/uiSlice';
import RegeneratePanelModal from './RegeneratePanelModal';
import { hexToRgb } from '../services/utils';
import { decodeAudioData } from '../services/audioUtils';
import ConfirmVideoModal from './ConfirmVideoModal';
import { getMediaBlob } from '../services/db';

interface SpeechBubbleProps {
  panel: PanelData;
  x: number;
  y: number;
  width: number;
  settings: SpeechBubbleSettings;
  onDialogueChange: (newDialogue: string) => void;
  isGeneratingAudio: boolean;
  dynamicScale: number;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = React.memo(
  ({
    panel,
    x,
    y,
    width,
    settings,
    onDialogueChange,
    isGeneratingAudio,
    dynamicScale,
  }) => {
    const {
      fontSize,
      fontFamily,
      style,
      backgroundColor,
      textColor,
      opacity,
      strokeColor,
      strokeWidth,
    } = settings;
    const [isEditing, setIsEditing] = React.useState(false);
    const [editedText, setEditedText] = React.useState(panel.dialogue);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const dispatch = useAppDispatch();
    const audioContextRef = React.useRef<AudioContext | null>(null);
    const [audioUrl, setAudioUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        let objectUrl: string | undefined;
        const loadAudio = async () => {
            if (panel.audioId) {
                const blob = await getMediaBlob(panel.audioId);
                if (blob) {
                    objectUrl = URL.createObjectURL(blob);
                    setAudioUrl(objectUrl);
                }
            } else {
                setAudioUrl(null);
            }
        };
        loadAudio();
        return () => {
            if(objectUrl) URL.revokeObjectURL(objectUrl);
        }
    }, [panel.audioId]);

    const scaledFontSize = fontSize * dynamicScale;

    React.useEffect(() => {
      if (isEditing && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [isEditing]);

    const playAudio = React.useCallback(async (url: string) => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext ||
            window.webkitAudioContext)({ sampleRate: 24000 });
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
      } catch (error: unknown) {
        console.error('Failed to play audio:', error);
        dispatch(addToast({ type: 'error', message: 'Could not play audio.' }));
      }
    }, [dispatch]);

    const handleBubbleClick = React.useCallback((e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent panel activation
      if (isEditing) return;
      if (audioUrl) {
        playAudio(audioUrl);
      } else if (!isGeneratingAudio) {
        dispatch(
          generateSpeechForPanel({ panelId: panel.id, text: panel.dialogue }),
        );
      }
    }, [isEditing, audioUrl, panel.id, panel.dialogue, playAudio, isGeneratingAudio, dispatch]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleBubbleClick(e as unknown as React.MouseEvent);
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

    const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

    const bgRgb = hexToRgb(backgroundColor);
    const strokeRgb = hexToRgb(strokeColor);
    
    const bubbleStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${x * dynamicScale}px`,
      top: `${y * dynamicScale}px`,
      maxWidth: `${width * dynamicScale}px`,
      transform: 'translate(-50%, -100%)',
      transformOrigin: 'bottom center',
      color: textColor,
      zIndex: 20, // Ensure bubbles are above active panel overlays
    };
    
    const bodyStyle: React.CSSProperties = {
        backgroundColor: bgRgb ? `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, ${opacity})` : 'rgba(255, 255, 255, 0.9)',
        padding: `${8 * dynamicScale}px`,
        boxShadow: `0 0 0 ${strokeWidth * dynamicScale}px ${strokeColor}`,
    };

    return (
      <div
        style={bubbleStyle}
        role="button"
        tabIndex={0}
        aria-label={`Play audio for dialogue: ${panel.dialogue}`}
        onClick={handleBubbleClick}
        onKeyDown={handleKeyDown}
        onDoubleClick={() => !isEditing && setIsEditing(true)}
        className="transition-transform duration-300 hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <div className={`${bubbleClasses}`} style={bodyStyle}>
            <div className="flex items-start gap-2">
            <div className="flex-grow">
                {isEditing ? (
                <textarea
                    ref={textareaRef}
                    value={editedText}
                    onChange={handleTextareaChange}
                    onBlur={handleSave}
                    onKeyDown={handleTextareaKeyDown}
                    style={{
                    fontSize: `${scaledFontSize}px`,
                    fontFamily: fontFamily,
                    }}
                    className="bg-transparent border-none focus:outline-none focus:ring-0 resize-none w-full overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                />
                ) : (
                <p
                    style={{
                    hyphens: 'auto',
                    fontSize: `${scaledFontSize}px`,
                    fontFamily: fontFamily,
                    }}
                >
                    {panel.dialogue}
                </p>
                )}
            </div>
            {isGeneratingAudio ? (
              <div
                className="flex-shrink-0"
                style={{
                  width: 16 * dynamicScale,
                  height: 16 * dynamicScale,
                }}
              >
                <LoaderIcon className="w-full h-full animate-spin" />
              </div>
            ) : (
              <div
                className="flex-shrink-0"
                style={{
                  width: 16 * dynamicScale,
                  height: 16 * dynamicScale,
                }}
              >
                <SpeakerWaveIcon className="w-full h-full opacity-50" />
              </div>
            )}
            </div>
        </div>
        <div
          className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            bottom: `${(-8 - strokeWidth) * dynamicScale}px`,
            borderLeft: `${8 * dynamicScale}px solid transparent`,
            borderRight: `${8 * dynamicScale}px solid transparent`,
            borderTop: `${8 * dynamicScale}px solid ${strokeColor}`,
            zIndex: 1,
          }}
        ></div>
         <div
          className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            bottom: `${-8 * dynamicScale}px`,
            borderLeft: `${8 * dynamicScale}px solid transparent`,
            borderRight: `${8 * dynamicScale}px solid transparent`,
            borderTop: bgRgb ? `${8 * dynamicScale}px solid rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, ${opacity})` : `${8 * dynamicScale}px solid white`,
            zIndex: 2,
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
  onGenerateVideoClick: (panel: PanelData) => void;
  isRegenerating: boolean;
  isVideoGenerating: boolean;
  isAudioGenerating: boolean;
  pageNumber: number;
  dynamicScale: number;
}

const Panel: React.FC<PanelProps> = React.memo(
  ({
    panel,
    bubblePosition,
    showSpeechBubbles,
    speechBubbleSettings,
    onRegenerateClick,
    onGenerateVideoClick,
    isRegenerating,
    isVideoGenerating,
    isAudioGenerating,
    pageNumber,
    dynamicScale,
  }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [isTouched, setIsTouched] = React.useState(false);
    const panelRef = React.useRef<HTMLDivElement>(null);
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    
    const [mediaUrl, setMediaUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        let objectUrl: string | undefined;

        const loadMedia = async () => {
            const mediaId = panel.videoId || panel.imageId;
            if (mediaId) {
                const blob = await getMediaBlob(mediaId);
                if (blob) {
                    objectUrl = URL.createObjectURL(blob);
                    setMediaUrl(objectUrl);
                }
            } else {
                setMediaUrl(null);
            }
        };

        if (isVisible) {
            loadMedia();
        }

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [panel.imageId, panel.videoId, isVisible]);


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

    const handleInteractionMove = React.useCallback(
      (e: MouseEvent) => {
        if (!interactionRef.current || dynamicScale === 0) return;

        const deltaX = (e.clientX - interactionRef.current.startX) / dynamicScale;
        const deltaY = (e.clientY - interactionRef.current.startY) / dynamicScale;

        if (interactionRef.current.type === 'move') {
          setCurrentLayout((prev) => ({
            ...prev,
            x: interactionRef.current!.startPanelX + deltaX,
            y: interactionRef.current!.startPanelY + deltaY,
          }));
        } else {
          // resize
          setCurrentLayout((prev) => ({
            ...prev,
            width: Math.max(100, interactionRef.current!.startPanelWidth + deltaX),
            height: Math.max(
              100,
              interactionRef.current!.startPanelHeight + deltaY,
            ),
          }));
        }
      },
      [dynamicScale],
    );
    
    const handleInteractionEnd = React.useCallback(() => {
      window.removeEventListener('mousemove', handleInteractionMove);
      window.removeEventListener('mouseup', handleInteractionEnd);

      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';

      setCurrentLayout((latestLayout) => {
        dispatch(
          updatePanelLayout({
            pageNumber,
            panelId: panel.id,
            layout: latestLayout,
          }),
        );
        return latestLayout;
      });

      interactionRef.current = null;
    }, [dispatch, pageNumber, panel.id, handleInteractionMove]);

    const handleInteractionStart = React.useCallback(
      (e: React.MouseEvent<HTMLDivElement>, type: 'move' | 'resize') => {
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
      },
      [currentLayout, handleInteractionMove, handleInteractionEnd],
    );

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
        dispatch(
          updatePanelDialogue({ pageNumber, panelId: panel.id, newDialogue }),
        );
      },
      [dispatch, panel.id, pageNumber],
    );

    const isLoading = isRegenerating || isVideoGenerating;

    // Click handler to toggle active state on touch devices and desktop
    const handlePanelClick = () => {
        setIsTouched(!isTouched);
    };

    return (
      <div
        ref={panelRef}
        data-panel-id={panel.id} // Add data attribute for context detection
        onClick={handlePanelClick}
        className={`absolute bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg group ${isTouched ? 'ring-4 ring-indigo-500/50 z-10' : ''}`}
        style={{
          left: `${currentLayout.x * dynamicScale}px`,
          top: `${currentLayout.y * dynamicScale}px`,
          width: `${currentLayout.width * dynamicScale}px`,
          height: `${currentLayout.height * dynamicScale}px`,
          transition: interactionRef.current ? 'none' : 'all 0.2s ease-in-out',
        }}
      >
        {mediaUrl && panel.videoId ? (
          <video
            src={mediaUrl}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : mediaUrl ? (
          <img
            src={mediaUrl}
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
            dynamicScale={dynamicScale}
          />
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-4 text-center z-20">
            <div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin mb-4"></div>
            <p className="font-semibold">
              {isRegenerating ? t('comic.regeneratingImage') : t('comic.generatingVideo')}
            </p>
            {isVideoGenerating && (
              <p className="text-sm mt-2">
                {t('comic.videoGenerationHint')}
              </p>
            )}
          </div>
        )}
        {!isLoading && (
          <>
            <div
              className={`panel-handle panel-move-handle transition-opacity duration-300 ${isTouched ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              onMouseDown={(e) => handleInteractionStart(e, 'move')}
              title={t('comic.movePanel')}
              role="button"
              aria-label={t('comic.movePanel')}
            >
              <MoveIcon className="w-5 h-5 text-gray-800" />
            </div>
            <div
              className={`panel-handle panel-resize-handle transition-opacity duration-300 ${isTouched ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              onMouseDown={(e) => handleInteractionStart(e, 'resize')}
              title={t('comic.resizePanel')}
              role="button"
              aria-label={t('comic.resizePanel')}
            />
            <div className={`absolute inset-0 bg-black/60 flex items-center justify-center gap-2 transition-opacity duration-300 z-10 ${isTouched ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'}`}>
              <button
                onClick={(e) => { e.stopPropagation(); onRegenerateClick(panel); }}
                className="p-3 bg-white/90 text-gray-900 rounded-full hover:bg-white backdrop-blur-sm transition-transform hover:scale-110 shadow-lg"
                aria-label={t('comic.regeneratePanelAria')}
              >
                <RefreshCwIcon className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onGenerateVideoClick(panel); }}
                className="p-3 bg-white/90 text-gray-900 rounded-full hover:bg-white backdrop-blur-sm transition-transform hover:scale-110 shadow-lg"
                aria-label={t('comic.generateVideoPanelAria')}
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
  dynamicScale: number;
}

const ComicPage = React.forwardRef<HTMLDivElement, ComicPageProps>(
  ({ page, settings, dynamicScale }, ref) => {
    const [bubblePositions, setBubblePositions] = React.useState<
      Record<string, { x: number; y: number }>
    >({});
    const [panelToRegenerate, setPanelToRegenerate] =
      React.useState<PanelData | null>(null);
    const [panelForVideo, setPanelForVideo] =
      React.useState<PanelData | null>(null);
    const dispatch = useAppDispatch();

    const {
      panelRegenerationStatus,
      panelVideoGenerationStatus,
      panelAudioGenerationStatus,
    } = useAppSelector((state) => state.project.present);

    const panelsWithDialogue = React.useMemo(
      () => page.panels.filter((p) => p.dialogue && p.dialogue.trim() !== ''),
      [page.panels],
    );

    const { showSpeechBubbles, speechBubbles, generation } = settings;

    React.useEffect(() => {
      if (panelsWithDialogue.length === 0) {
        setBubblePositions({});
        return;
      }

      if (speechBubbles.placementAlgorithm === 'static') {
        const staticPositions: Record<string, { x: number; y: number }> = {};
        for (const p of panelsWithDialogue) {
          staticPositions[p.id] = { x: p.width / 2, y: 50 }; // Top-center, relative to panel
        }
        setBubblePositions(staticPositions);
        return;
      }
      
      const worker = new Worker(
        new URL('../services/speechBubbleWorker.ts', import.meta.url),
        {
          type: 'module',
        },
      );

      worker.onmessage = (
        event: MessageEvent<Record<string, { x: number; y: number }>>,
      ) => {
        setBubblePositions(event.data);
      };

      worker.onerror = (error: ErrorEvent) => {
        console.error('Speech bubble worker error:', error);
      };

      const panelDataForWorker = panelsWithDialogue.map((p) => ({
        id: p.id,
        x: p.x,
        y: p.y,
        width: p.width,
        height: p.height,
      }));

      worker.postMessage({ panelsWithDialogue: panelDataForWorker });

      return () => {
        worker.terminate();
      };
    }, [panelsWithDialogue, speechBubbles.placementAlgorithm]);

    const { pageBorder } = generation;

    const handleRegenerateSuccess = React.useCallback(() => {
      setPanelToRegenerate(null);
    }, []);

    const confirmAndGenerateVideo = React.useCallback(async () => {
      if (!panelForVideo) return;
      const panelToProcess = panelForVideo;
      setPanelForVideo(null);

      try {
        if (
          window.aistudio &&
          typeof window.aistudio.hasSelectedApiKey === 'function'
        ) {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          if (!hasKey) {
            await window.aistudio.openSelectKey();
          }
        }
        await dispatch(
          generatePanelVideo({
            panelId: panelToProcess.id,
            prompt: panelToProcess.originalVisualPrompt,
          }),
        ).unwrap();
      } catch (e: unknown) {
        console.error('Video generation failed:', e);
        let errorMessage = 'An unknown error occurred.';
        if (e instanceof Error) {
          errorMessage = e.message;
        }

        if (
          errorMessage.includes('API Key Error') ||
          errorMessage.includes('Requested entity was not found')
        ) {
          dispatch(
            addToast({
              type: 'error',
              message:
                'Invalid API Key. Please select a valid key to generate videos.',
            }),
          );
          if (window.aistudio?.openSelectKey) {
            await window.aistudio.openSelectKey();
          }
        }
      }
    }, [dispatch, panelForVideo]);

    return (
      <>
        <div
          ref={ref}
          className="bg-white dark:bg-gray-800 shadow-2xl relative w-full h-full"
          style={{
            border: pageBorder.enabled
              ? `${10 * dynamicScale}px solid ${pageBorder.color}`
              : 'none',
            boxSizing: 'border-box',
          }}
        >
          {page.panels.map((panel) => (
            <Panel
              key={panel.id}
              panel={panel}
              bubblePosition={bubblePositions[panel.id]}
              showSpeechBubbles={showSpeechBubbles}
              speechBubbleSettings={speechBubbles}
              onRegenerateClick={setPanelToRegenerate}
              onGenerateVideoClick={setPanelForVideo}
              isRegenerating={panelRegenerationStatus[panel.id] === 'loading'}
              isVideoGenerating={
                panelVideoGenerationStatus[panel.id] === 'loading'
              }
              isAudioGenerating={
                panelAudioGenerationStatus[panel.id] === 'loading'
              }
              pageNumber={page.pageNumber}
              dynamicScale={dynamicScale}
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
        {panelForVideo && (
          <ConfirmVideoModal
            onCancel={() => setPanelForVideo(null)}
            onConfirm={confirmAndGenerateVideo}
          />
        )}
      </>
    );
  },
);

export default React.memo(ComicPage);