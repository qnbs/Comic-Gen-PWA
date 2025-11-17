import JSZip from 'jszip';
import { forceSimulation, forceCollide, forceManyBody } from 'd3-force';
import type {
  ComicProject,
  AppSettings,
  ComicBookPage,
  PanelData,
} from '../types';
import { hexToRgb } from './utils';

// --- Speech Bubble Layout Calculation ---
interface SimulationNode {
  id: string;
  panel: PanelData;
  x: number;
  y: number;
}

function calculateSpeechBubblePositions(
  page: ComicBookPage,
): Record<string, { x: number; y: number }> {
  const panelsWithDialogue = page.panels.filter(
    (p) => p.dialogue && p.dialogue.trim() !== '',
  );
  if (panelsWithDialogue.length === 0) return {};

  const nodes: SimulationNode[] = panelsWithDialogue.map((panel) => ({
    id: panel.id,
    panel,
    x: panel.x + panel.width / 2,
    y: panel.y + 50,
  }));

  const simulation = forceSimulation(nodes)
    .force('collide', forceCollide().radius(60).strength(0.8))
    .force('repel', forceManyBody().strength(-200))
    .stop();

  const n = Math.ceil(
    Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()),
  );
  for (let i = 0; i < n; ++i) {
    simulation.tick();
    nodes.forEach((node) => {
      const panel = node.panel;
      const radius = 30;
      node.x = Math.max(panel.x + radius, Math.min(panel.x + panel.width - radius, node.x));
      node.y = Math.max(panel.y + radius, Math.min(panel.y + panel.height - radius - 20, node.y));
    });
  }

  const finalPositions: Record<string, { x: number; y: number }> = {};
  nodes.forEach((node) => {
    finalPositions[node.id] = { x: node.x, y: node.y };
  });
  return finalPositions;
}

// --- Page Rendering to Canvas ---

async function renderPageToCanvas(
  page: ComicBookPage,
  settings: AppSettings,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = 1100 * 2; // Render at 2x for high quality
  canvas.height = 1600 * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  // 1. Draw Page Background and Border
  ctx.fillStyle = settings.generation.pageBorder.enabled ? settings.generation.pageBorder.color : 'white';
  ctx.fillRect(0, 0, 1100, 1600);
  const borderOffset = settings.generation.pageBorder.enabled ? 10 : 0;
  ctx.fillStyle = 'white'; // Inner page color
  ctx.fillRect(borderOffset, borderOffset, 1100 - borderOffset * 2, 1600 - borderOffset * 2);

  // 2. Load and Draw Panel Images
  const imagePromises = page.panels.map(
    (panel) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = panel.imageUrl;
      }),
  );
  const loadedImages = await Promise.all(imagePromises);

  page.panels.forEach((panel, index) => {
    const img = loadedImages[index];
    ctx.drawImage(img, panel.x, panel.y, panel.width, panel.height);
  });

  // 3. Draw Speech Bubbles
  if (settings.showSpeechBubbles) {
    const bubblePositions = calculateSpeechBubblePositions(page);
    const { speechBubbles } = settings;
    const { style, fontSize, fontFamily, backgroundColor, textColor, opacity } = speechBubbles;

    for (const panel of page.panels) {
      const pos = bubblePositions[panel.id];
      if (pos && panel.dialogue && panel.dialogue.trim() !== '') {
        const bgRgb = hexToRgb(backgroundColor);
        ctx.fillStyle = bgRgb
          ? `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, ${opacity})`
          : 'rgba(255, 255, 255, 0.9)';
        
        ctx.font = `${fontSize}px ${fontFamily}`;
        
        // Word wrapping logic
        const maxWidth = panel.width * 0.8;
        const padding = 12;
        const words = panel.dialogue.split(' ');
        let line = '';
        const lines = [];
        for (const word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth - padding * 2 && line !== '') {
                lines.push(line);
                line = word + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        const lineHeight = fontSize * 1.2;
        const bubbleHeight = lines.length * lineHeight + padding * 2;
        const bubbleWidth = Math.min(maxWidth, ctx.measureText(lines.reduce((a, b) => a.length > b.length ? a : b)).width) + padding * 2;

        const bubbleX = pos.x - bubbleWidth / 2;
        const bubbleY = pos.y - bubbleHeight - 10; // 10 for tail

        // Draw bubble body
        ctx.beginPath();
        if (style === 'sharp') {
            ctx.rect(bubbleX, bubbleY, bubbleWidth, bubbleHeight);
        } else {
            const r = style === 'cloud' ? 20 : 10;
            ctx.moveTo(bubbleX + r, bubbleY);
            ctx.lineTo(bubbleX + bubbleWidth - r, bubbleY);
            ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + r);
            ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - r);
            ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - r, bubbleY + bubbleHeight);
            ctx.lineTo(bubbleX + r, bubbleY + bubbleHeight);
            ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - r);
            ctx.lineTo(bubbleX, bubbleY + r);
            ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + r, bubbleY);
        }
        ctx.closePath();
        ctx.fill();

        // Draw bubble tail
        ctx.beginPath();
        ctx.moveTo(pos.x - 8, bubbleY + bubbleHeight);
        ctx.lineTo(pos.x + 8, bubbleY + bubbleHeight);
        ctx.lineTo(pos.x, bubbleY + bubbleHeight + 10);
        ctx.closePath();
        ctx.fill();

        // Draw text
        ctx.fillStyle = textColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        lines.forEach((l, i) => {
            ctx.fillText(l.trim(), bubbleX + padding, bubbleY + padding + i * lineHeight);
        });
      }
    }
  }

  return canvas;
}

// --- Export Functions ---

export async function exportProjectAsPdf(
  project: ComicProject,
  settings: AppSettings,
): Promise<void> {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'px',
    format: [1100, 1600],
  });

  for (let i = 0; i < project.pages.length; i++) {
    const page = project.pages[i];
    const canvas = await renderPageToCanvas(page, settings);
    const imgData = canvas.toDataURL('image/png');

    if (i > 0) {
      pdf.addPage();
    }
    pdf.addImage(imgData, 'PNG', 0, 0, 1100, 1600, undefined, 'FAST');
  }

  const safeTitle = project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  await pdf.save(`${safeTitle}.pdf`, { returnPromise: true });
}

export async function exportProjectAsCbz(
  project: ComicProject,
  settings: AppSettings,
): Promise<void> {
  const zip = new JSZip();

  for (const page of project.pages) {
    const canvas = await renderPageToCanvas(page, settings);
    const pageBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png'),
    );

    if (pageBlob) {
      const paddedIndex = String(page.pageNumber).padStart(3, '0');
      zip.file(`page_${paddedIndex}.png`, pageBlob);
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(zipBlob);
  const safeTitle = project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.download = `${safeTitle}.cbz`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}