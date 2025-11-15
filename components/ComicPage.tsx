import React from 'react';
import type {
  ComicPageData,
  PanelData,
  AppSettings,
  SpeechBubbleSettings,
} from '../types';
import {
  forceSimulation,
  forceCollide,
  forceManyBody,
} from 'd3-force';
import { useTranslation } from '../hooks/useTranslation';
import { RefreshCwIcon } from './Icons';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  updatePanelDialogue,
  regeneratePanel,
} from '../features/generationSlice';
import RegeneratePanelModal from './RegeneratePanelModal';

interface SpeechBubbleProps {
  dialogue: string;
  x: number;
  y: number;
  width: number;
  settings: SpeechBubbleSettings;
  onDialogueChange: (newDialogue: string) => void;
}

const hexToRgb = (
  hex: string,
): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const SpeechBubble: React.FC<SpeechBubbleProps> = React.memo(
  ({ dialogue, x, y, width, settings, onDialogueChange }) => {
    const {
      fontSize,
      fontFamily,
      style,
      backgroundColor,
      textColor,
      opacity,
    } = settings;
    const [isEditing, setIsEditing] = React.useState(false);
    const [editedText, setEditedText] = React.useState(dialogue);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
      if (isEditing && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [isEditing]);

    if (!dialogue || dialogue.trim() === '') return null;

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
      if (editedText !== dialogue) {
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
        setEditedText(dialogue);
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
        className={`absolute p-2 shadow-md ${bubbleClasses} transition-transform duration-300 hover:scale-105 cursor-text`}
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
        onClick={() => !isEditing && setIsEditing(true)}
      >
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
            {dialogue}
          </p>
        )}
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
}

const Panel: React.FC<PanelProps> = React.memo(
  ({
    panel,
    bubblePosition,
    showSpeechBubbles,
    speechBubbleSettings,
    onRegenerateClick,
    isRegenerating,
  }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const panelRef = React.useRef<HTMLDivElement>(null);
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

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
        dispatch(updatePanelDialogue({ panelId: panel.id, newDialogue }));
      },
      [dispatch, panel.id],
    );

    return (
      <div
        ref={panelRef}
        className="absolute bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 ease-in-out group"
        style={{
          left: `${panel.x}px`,
          top: `${panel.y}px`,
          width: `${panel.width}px`,
          height: `${panel.height}px`,
        }}
      >
        {isVisible ? (
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
            dialogue={panel.dialogue}
            x={bubblePosition.x}
            y={bubblePosition.y}
            width={panel.width * 0.8}
            settings={speechBubbleSettings}
            onDialogueChange={handleDialogueChange}
          />
        )}
        {isRegenerating && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
          </div>
        )}
        {!isRegenerating && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              onClick={() => onRegenerateClick(panel)}
              className="p-3 bg-white/80 text-gray-900 rounded-full hover:bg-white backdrop-blur-sm transition-transform hover:scale-110"
              aria-label={t('comic.regeneratePanelAria')}
            >
              <RefreshCwIcon className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    );
  },
);

interface ComicPageProps {
  page: ComicPageData;
  settings: AppSettings;
  scale: number;
}

// FIX: Redefine SimulationNode to explicitly include properties from d3-force's SimulationNodeDatum.
// This resolves TypeScript errors where 'x' and 'y' were reported as not existing on the type,
// likely due to an issue with how the extended interface was being resolved.
interface SimulationNode {
  id: string;
  panel: PanelData;
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

const ComicPage = React.forwardRef<HTMLDivElement, ComicPageProps>(
  ({ page, settings, scale }, ref) => {
    const [bubblePositions, setBubblePositions] = React.useState<
      Record<string, { x: number; y: number }>
    >({});
    const [panelToRegenerate, setPanelToRegenerate] =
      React.useState<PanelData | null>(null);

    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const { panelRegenerationStatus } = useAppSelector(
      (state) => state.generation,
    );

    const panelsWithDialogue = React.useMemo(
      () => page.panels.filter((p) => p.dialogue && p.dialogue.trim() !== ''),
      [page.panels],
    );

    React.useEffect(() => {
      const urls = page.panels.map((p) => p.imageUrl);
      return () => {
        urls.forEach((url) => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      };
    }, [page]);

    React.useEffect(() => {
      if (panelsWithDialogue.length === 0) return;

      const nodes: SimulationNode[] = panelsWithDialogue.map((panel) => ({
        id: panel.id,
        panel: panel,
        x: panel.x + panel.width / 2,
        y: panel.y + 50,
      }));

      const simulation = forceSimulation(nodes)
        .force('collide', forceCollide().radius(60).strength(0.8))
        .force('repel', forceManyBody().strength(-200))
        .on('tick', () => {
          nodes.forEach((node) => {
            const panel = node.panel;
            const radius = 30;
            node.x = Math.max(
              panel.x + radius,
              Math.min(panel.x + panel.width - radius, node.x!),
            );
            node.y = Math.max(
              panel.y + radius,
              Math.min(panel.y + panel.height - radius - 20, node.y!),
            );
          });
        })
        .on('end', () => {
          const finalPositions: Record<string, { x: number; y: number }> = {};
          nodes.forEach((node) => {
            finalPositions[node.id] = {
              x: node.x! - node.panel.x,
              y: node.y! - node.panel.y,
            };
          });
          setBubblePositions(finalPositions);
        });

      return () => simulation.stop();
    }, [panelsWithDialogue]);

    const { showSpeechBubbles, speechBubbles, generation } = settings;
    const { pageBorder } = generation;

    const handleRegenerate = (newPrompt: string) => {
      if (panelToRegenerate) {
        dispatch(regeneratePanel({ panelId: panelToRegenerate.id, newPrompt }));
        setPanelToRegenerate(null);
      }
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
            transformOrigin: 'top left',
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
            />
          ))}
        </div>
        {panelToRegenerate && (
          <RegeneratePanelModal
            panel={panelToRegenerate}
            onClose={() => setPanelToRegenerate(null)}
            onRegenerate={handleRegenerate}
          />
        )}
      </>
    );
  },
);

export default ComicPage;
