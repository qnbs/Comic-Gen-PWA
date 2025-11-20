import JSZip from 'jszip';
import { forceSimulation, forceCollide, forceManyBody } from 'd3-force';
import type {
  ComicProject,
  AppSettings,
  ComicBookPage,
  PanelData,
} from '../types';
import { hexToRgb, blobToBase64 } from './utils';
import * as db from './db';

interface ExportedProject {
  projectData: ComicProject;
  media: Record<string, { mimeType: string; data: string }>; // id: { mime, base64 }
}

interface FullBackup {
  type: 'ComicGenPWA_Backup';
  version: number;
  projects: ComicProject[];
  media: Record<string, { mimeType: string; data: string }>;
}


// --- Speech Bubble Layout Calculation ---
interface SimulationNode {
  id: string;
  panel: PanelData;
  x: number;
  y: number;
}

function calculateSpeechBubblePositions(
  page: ComicBookPage,
  algorithm: 'physics' | 'static',
): Record<string, { x: number; y: number }> {
  const panelsWithDialogue = page.panels.filter(
    (p) => p.dialogue && p.dialogue.trim() !== '',
  );
  if (panelsWithDialogue.length === 0) return {};

  const finalPositions: Record<string, { x: number; y: number }> = {};
  
  if (algorithm === 'static') {
    panelsWithDialogue.forEach(panel => {
        finalPositions[panel.id] = { x: panel.x + panel.width / 2, y: panel.y + 50 };
    });
    return finalPositions;
  }
  
  // Physics-based algorithm
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
  const scale = 2; // Render at 2x for high quality
  canvas.width = 1100 * scale;
  canvas.height = 1600 * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  // 1. Draw Page Background and Border
  ctx.fillStyle = settings.generation.pageBorder.enabled ? settings.generation.pageBorder.color : 'white';
  ctx.fillRect(0, 0, 1100, 1600);
  const borderOffset = settings.generation.pageBorder.enabled ? 10 : 0;
  ctx.fillStyle = 'white'; // Inner page color
  ctx.fillRect(borderOffset, borderOffset, 1100 - borderOffset * 2, 1600 - borderOffset * 2);

  // 2. Load and Draw Panel Images from IndexedDB
  const imagePromises = page.panels.map(
    async (panel) => {
      const blob = await db.getMediaBlob(panel.imageId);
      if (!blob) throw new Error(`Could not load image blob for panel ${panel.id}`);
      const url = URL.createObjectURL(blob);
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = reject;
        img.src = url;
      });
    }
  );
  const loadedImages = await Promise.all(imagePromises);

  page.panels.forEach((panel, index) => {
    const img = loadedImages[index];
    ctx.drawImage(img, panel.x, panel.y, panel.width, panel.height);
  });

  // 3. Draw Speech Bubbles
  if (settings.showSpeechBubbles) {
    const { speechBubbles } = settings;
    const bubblePositions = calculateSpeechBubblePositions(page, speechBubbles.placementAlgorithm);
    
    const { style, fontSize, fontFamily, backgroundColor, textColor, opacity, strokeColor, strokeWidth } = speechBubbles;

    for (const panel of page.panels) {
      const pos = bubblePositions[panel.id];
      if (pos && panel.dialogue && panel.dialogue.trim() !== '') {
        const bgRgb = hexToRgb(backgroundColor);
        ctx.fillStyle = bgRgb
          ? `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, ${opacity})`
          : 'rgba(255, 255, 255, 0.9)';
        
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;

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
        if (strokeWidth > 0) ctx.stroke();
        ctx.fill();

        // Draw bubble tail
        ctx.beginPath();
        ctx.moveTo(pos.x - 8, bubbleY + bubbleHeight);
        ctx.lineTo(pos.x + 8, bubbleY + bubbleHeight);
        ctx.lineTo(pos.x, bubbleY + bubbleHeight + 10);
        ctx.closePath();
        if (strokeWidth > 0) ctx.stroke();
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

const getAllMediaIds = (project: ComicProject): Set<string> => {
    const mediaIds = new Set<string>();
    if (project.thumbnailId) mediaIds.add(project.thumbnailId);
    project.worldDB.characters.forEach(c => {
        if(c.referenceImageId) mediaIds.add(c.referenceImageId);
        c.poses?.forEach(p => p.referenceImageId && mediaIds.add(p.referenceImageId));
    });
    project.worldDB.locations.forEach(l => l.referenceImageId && mediaIds.add(l.referenceImageId));
    project.worldDB.props.forEach(p => p.referenceImageId && mediaIds.add(p.referenceImageId));
    project.pages.forEach(page => {
      page.panels.forEach(panel => {
        if (panel.imageId) mediaIds.add(panel.imageId);
        if (panel.videoId) mediaIds.add(panel.videoId);
        if (panel.audioId) mediaIds.add(panel.audioId);
      });
    });
    return mediaIds;
};

export async function exportProjectAsJson(project: ComicProject): Promise<void> {
    const media: ExportedProject['media'] = {};
    const mediaIds = getAllMediaIds(project);

    // Fetch blobs and convert to base64
    for (const id of mediaIds) {
        const blob = await db.getMediaBlob(id);
        if (blob) {
            const data = await blobToBase64(blob);
            media[id] = { mimeType: blob.type, data };
        }
    }

    const exportData: ExportedProject = {
        projectData: project,
        media,
    };

    const projectJson = JSON.stringify(exportData, null, 2);
    const blob = new Blob([projectJson], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const safeTitle = project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeTitle}_comic_project.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

export async function exportAllProjectsAsJson(): Promise<void> {
    const allProjectsMetas = await db.getProjects();
    const allProjects: ComicProject[] = [];
    for (const meta of allProjectsMetas) {
        const project = await db.getProject(meta.id);
        if (project) {
            allProjects.push(project);
        }
    }

    if (allProjects.length === 0) {
        throw new Error("No projects found to export.");
    }

    const allMedia: FullBackup['media'] = {};
    const allMediaIds = new Set<string>();

    allProjects.forEach(project => {
        getAllMediaIds(project).forEach(id => allMediaIds.add(id));
    });

    for (const id of allMediaIds) {
        const blob = await db.getMediaBlob(id);
        if (blob) {
            const data = await blobToBase64(blob);
            allMedia[id] = { mimeType: blob.type, data };
        }
    }

    const exportData: FullBackup = {
        type: 'ComicGenPWA_Backup',
        version: 1,
        projects: allProjects,
        media: allMedia,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const date = new Date().toISOString().split('T')[0];
    link.download = `comic_gen_pwa_backup_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}


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
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    if (i > 0) {
      pdf.addPage();
    }
    pdf.addImage(imgData, 'JPEG', 0, 0, 1100, 1600);
  }

  const safeTitle = project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  await pdf.save(`${safeTitle}.pdf`);
}

export async function exportProjectAsCbz(
  project: ComicProject,
  settings: AppSettings,
): Promise<void> {
  const zip = new JSZip();

  const metadata = `
    <ComicInfo xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <Title>${project.title}</Title>
      <Writer>Comic-Gen PWA</Writer>
      <Summary>A comic generated from text using an AI-algorithmic engine.</Summary>
      <PageCount>${project.pages.length}</PageCount>
      <LanguageISO>en</LanguageISO>
      <Format>CBZ</Format>
    </ComicInfo>
  `;
  zip.file('ComicInfo.xml', metadata);

  for (let i = 0; i < project.pages.length; i++) {
    const page = project.pages[i];
    const pageNumber = String(i + 1).padStart(3, '0');
    try {
      const canvas = await renderPageToCanvas(page, settings);
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      if (blob) {
        zip.file(`page_${pageNumber}.jpg`, blob);
      }
    } catch (e) {
      console.error(`Failed to render page ${page.pageNumber} for CBZ export`, e);
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
