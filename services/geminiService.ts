import { GoogleGenAI, Type } from '@google/genai';
import type { Scene, ImageQuality, AspectRatio, ArtStyle } from '../types';
import { translations } from './translations';

if (!process.env.API_KEY) {
  throw new Error('API_KEY environment variable not set');
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const textModel = 'gemini-2.5-pro';
const imageModel = 'imagen-4.0-generate-001';

const sceneSchema = {
  type: Type.OBJECT,
  properties: {
    originalText: { type: Type.STRING },
    summary: { type: Type.STRING },
    characters: { type: Type.ARRAY, items: { type: Type.STRING } },
    dialogue: { type: Type.STRING },
    visualPrompt: { type: Type.STRING },
    actionScore: { type: Type.INTEGER },
  },
  required: [
    'originalText',
    'summary',
    'characters',
    'dialogue',
    'visualPrompt',
    'actionScore',
  ],
};

export async function segmentTextIntoScenes(
  text: string,
  lang: 'en' | 'de',
): Promise<string[]> {
  const t = (key: keyof typeof translations.en.gemini) =>
    translations[lang].gemini[key] || translations.en.gemini[key];
  const prompt = `${t('sceneSegmentationPreamble')}\n---\nTEXT:\n${text}\n---`;

  try {
    const response = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        temperature: 0.1,
      },
    });

    const jsonString = response.text.trim();
    const sceneTexts = JSON.parse(jsonString) as string[];

    if (
      !Array.isArray(sceneTexts) ||
      !sceneTexts.every((item) => typeof item === 'string')
    ) {
      throw new Error('Gemini API did not return a valid array of scene texts.');
    }

    return sceneTexts;
  } catch (error: unknown) {
    console.error('Error segmenting text into scenes with Gemini:', error);
    throw new Error(
      'Failed to segment the story into scenes. The AI model might be overloaded or the input text is not processable.',
    );
  }
}

export async function analyzeIndividualScene(
  sceneText: string,
  lang: 'en' | 'de',
): Promise<Scene> {
  const t = (key: keyof typeof translations.en.gemini) =>
    translations[lang].gemini[key] || translations.en.gemini[key];
  const prompt = `
    ${t('sceneAnalysisPreamble')}
    1. "originalText": ${t('originalTextPrompt')}
    2. "summary": ${t('summaryPrompt')}
    3. "characters": ${t('charactersPrompt')}
    4. "dialogue": ${t('dialoguePrompt')}
    5. "visualPrompt": ${t('visualPromptPrompt')}
    6. "actionScore": ${t('actionScorePrompt')}
    ---
    SCENE TEXT:
    ${sceneText}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: sceneSchema,
        temperature: 0.2,
      },
    });

    const jsonString = response.text.trim();
    const scene = JSON.parse(jsonString) as Scene;

    // Ensure the originalText is what we sent, as the model can sometimes alter it.
    scene.originalText = sceneText;

    return scene;
  } catch (error: unknown) {
    console.error(
      `Error analyzing scene: "${sceneText.substring(0, 50)}..."`,
      error,
    );
    throw new Error(
      'Failed to analyze one of the scenes. The AI model might be overloaded.',
    );
  }
}

const getArtStylePrompt = (style: ArtStyle): string => {
  switch (style) {
    case 'manga':
      return 'black and white manga style, screentones, sharp lines, dynamic angles, ';
    case 'noir':
      return 'black and white noir film style, high contrast, dramatic shadows, film grain, 1940s detective aesthetic, ';
    case 'watercolor':
      return 'soft watercolor painting style, vibrant washes of color, wet-on-wet technique, paper texture, ';
    case 'cyberpunk':
      return 'cyberpunk art style, neon-drenched city, rain, futuristic, glowing signs, high-tech low-life, ';
    case 'default':
    default:
      return 'In the style of 90s cel-shaded American comics, thick line weight, flat colors, dramatic shadows, ';
  }
};

export async function generatePanelImage(
  prompt: string,
  quality: ImageQuality,
  aspectRatio: AspectRatio,
  artStyle: ArtStyle,
  negativePrompt: string,
): Promise<string> {
  try {
    let finalPrompt = getArtStylePrompt(artStyle) + prompt;

    switch (quality) {
      case 'high':
        finalPrompt += ', masterpiece, 4k, ultra-detailed, sharp focus';
        break;
      case 'low':
        finalPrompt += ', sketch, simple style, quick drawing, rough lines';
        break;
      case 'medium':
      default:
        // No additions for medium quality
        break;
    }

    if (negativePrompt && negativePrompt.trim() !== '') {
      finalPrompt += `. Negative prompt: ${negativePrompt.trim()}`;
    }

    const response = await ai.models.generateImages({
      model: imageModel,
      prompt: finalPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error('Image generation failed, no images returned.');
    }

    return response.generatedImages[0].image.imageBytes;
  } catch (error: unknown) {
    console.error('Error generating image with Imagen:', error);
    throw new Error(
      `Failed to generate image for prompt: "${prompt.substring(0, 50)}..."`,
    );
  }
}

export async function generateCharacterSheet(
  characterName: string,
  context: string,
  lang: 'en' | 'de',
): Promise<{ description: string; imageUrl: string }> {
  const t = (
    key: keyof typeof translations.en.gemini,
    replacements?: { [key: string]: string | number },
  ) => {
    let text =
      translations[lang].gemini[key] || translations.en.gemini[key];
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        text = text.replace(`{{${placeholder}}}`, String(value));
      });
    }
    return text;
  };

  const descriptionPrompt = `
    ${t('characterDescriptionPrompt', { characterName })}
    CONTEXT:
    ${context}
  `;

  const descriptionResponse = await ai.models.generateContent({
    model: textModel,
    contents: descriptionPrompt,
  });
  const description = descriptionResponse.text.trim();

  // Image generation prompt remains in English for better model performance
  const imagePrompt = `
        Character sheet, full body portrait of ${characterName}, standing, neutral background.
        Description: ${description}
    `;
  const imageBytes = await generatePanelImage(
    imagePrompt,
    'high',
    '1:1',
    'default',
    'text, signature, watermark',
  );

  return { description, imageUrl: `data:image/jpeg;base64,${imageBytes}` };
}
