import React, { useEffect, useState, useMemo, forwardRef } from 'react';
import type { ComicPageData, PanelData, AppSettings } from '../types';
import { forceSimulation, forceCollide, forceX, forceY, forceManyBody } from 'd3-force';
import { useTranslation } from '../hooks/useTranslation';

interface SpeechBubbleProps {
  dialogue: string;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  fontFamily: string;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({ dialogue, x, y, width, fontSize, fontFamily }) => {
  if (!dialogue || dialogue.trim() === "") return null;
  
  return (
    <div 
        className="absolute p-2 bg-white text-black rounded-lg shadow-md opacity-90"
        style={{ 
            left: `${x}px`, 
            top: `${y}px`,
            maxWidth: `${width - 16}px`, // Ensure padding within the bubble
            transform: 'translate(-50%, -100%)', // Center bubble above the point, with vertical offset
            transformOrigin: 'bottom center',
        }}
    >
      <p style={{ hyphens: 'auto', fontSize: `${fontSize}px`, fontFamily: fontFamily }}>{dialogue}</p>
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white"></div>
    </div>
  );
};

interface PanelProps {
  panel: PanelData;
  bubblePosition?: { x: number; y: number };
  showSpeechBubbles: boolean;
  speechBubbleSettings: { fontSize: number; fontFamily: string };
}

const Panel: React.FC<PanelProps> = ({ panel, bubblePosition, showSpeechBubbles, speechBubbleSettings }) => {
  const bubbleWidth = panel.width * 0.8; // Give bubble a max width relative to panel
  
  return (
    <div
      className="absolute bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 ease-in-out hover:scale-105"
      style={{
        left: `${panel.x}px`,
        top: `${panel.y}px`,
        width: `${panel.width}px`,
        height: `${panel.height}px`,
      }}
    >
      <img src={panel.imageUrl} alt="Comic panel" className="w-full h-full object-cover" />
      {showSpeechBubbles && bubblePosition && (
          <SpeechBubble 
              dialogue={panel.dialogue} 
              x={bubblePosition.x} 
              y={bubblePosition.y} 
              width={bubbleWidth} 
              fontSize={speechBubbleSettings.fontSize}
              fontFamily={speechBubbleSettings.fontFamily}
          />
      )}
    </div>
  );
};

interface ComicPageProps {
  page: ComicPageData;
  settings: AppSettings;
}

const ComicPage = forwardRef<HTMLDivElement, ComicPageProps>(({ page, settings }, ref) => {
  const [bubblePositions, setBubblePositions] = useState<Record<string, {x: number, y: number}>>({});
  const { t } = useTranslation();

  const panelsWithDialogue = useMemo(() => page.panels.filter(p => p.dialogue && p.dialogue.trim() !== ""), [page.panels]);

  useEffect(() => {
    if (panelsWithDialogue.length === 0) return;

    const nodes = panelsWithDialogue.map(panel => ({
      id: panel.id,
      fx: null, // fixed x
      fy: null, // fixed y
      panel: panel,
      // Initial position guess: top center of the panel
      x: panel.x + panel.width / 2,
      y: panel.y + 50, 
    }));

    const simulation = forceSimulation(nodes)
        .force("collide", forceCollide().radius(60).strength(0.8)) // Prevent bubbles from overlapping
        .force("repel", forceManyBody().strength(-200)) // Push bubbles away from "important" areas (simulated)
        .on("tick", () => {
             // Boundary constraints for each node within its panel
             nodes.forEach(node => {
                const panel = node.panel;
                const radius = 30; // Approximation of bubble radius
                node.x = Math.max(panel.x + radius, Math.min(panel.x + panel.width - radius, node.x!));
                node.y = Math.max(panel.y + radius, Math.min(panel.y + panel.height - radius - 20, node.y!)); // -20 to avoid bottom edge
             });
        })
        .on("end", () => {
            const finalPositions: Record<string, {x: number, y: number}> = {};
            nodes.forEach(node => {
                // We want to render relative to the panel, not the whole page
                finalPositions[node.id] = { x: node.x! - node.panel.x, y: node.y! - node.panel.y };
            });
            setBubblePositions(finalPositions);
        });

    const focalPoints = panelsWithDialogue.map(p => ({
        fx: p.x + p.width / 2,
        fy: p.y + p.height * 0.6, // Assume focal point is slightly below center
        radius: 100, // Large repulsion radius
        isFocalPoint: true,
    }));
    
    simulation.nodes([...nodes, ...focalPoints]);
    simulation.alpha(1).restart();

    return () => simulation.stop();

  }, [panelsWithDialogue]);
  
  const { showSpeechBubbles, speechBubbleFontSize, speechBubbleFontFamily } = settings;

  return (
    <div 
      ref={ref}
      className="bg-white dark:bg-gray-800 shadow-2xl relative" 
      style={{ width: '1100px', height: '1600px', transform: 'scale(0.5)', transformOrigin: 'top center' }}
    >
        <div className="sm:hidden absolute -top-16 left-1/2 -translate-x-1/2 bg-yellow-200 text-black p-2 rounded-md text-center w-64 text-xs font-semibold">
           {t('comic.mobileHint')}
        </div>
        {page.panels.map((panel) => (
            <Panel 
                key={panel.id} 
                panel={panel} 
                bubblePosition={bubblePositions[panel.id]}
                showSpeechBubbles={showSpeechBubbles}
                speechBubbleSettings={{ fontSize: speechBubbleFontSize, fontFamily: speechBubbleFontFamily }}
            />
        ))}
    </div>
  );
});

export default ComicPage;