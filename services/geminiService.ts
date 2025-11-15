import { GoogleGenAI, Type } from "@google/genai";
import type { Scene, ImageQuality, AspectRatio } from '../types';
import { translations } from './translations';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
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
  required: ['originalText', 'summary', 'characters', 'dialogue', 'visualPrompt', 'actionScore'],
};

export async function analyzeBookText(text: string, lang: 'en' | 'de'): Promise<Scene[]> {
  const t = (key: keyof typeof translations.en.gemini) => translations[lang].gemini[key] || translations.en.gemini[key];

  const prompt = `
    ${t('bookAnalysisPreamble')}
    1. "originalText": ${t('originalTextPrompt')}
    2. "summary": ${t('summaryPrompt')}
    3. "characters": ${t('charactersPrompt')}
    4. "dialogue": ${t('dialoguePrompt')}
    5. "visualPrompt": ${t('visualPromptPrompt')}
    6. "actionScore": ${t('actionScorePrompt')}
    ---
    TEXT:
    ${text}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: sceneSchema,
        },
        temperature: 0.2,
      },
    });
    
    const jsonString = response.text.trim();
    const scenes = JSON.parse(jsonString);
    
    if (!Array.isArray(scenes)) {
        throw new Error("Gemini API did not return a valid array of scenes.");
    }

    return scenes;
  } catch (error) {
    console.error("Error analyzing book text with Gemini:", error);
    throw new Error("Failed to analyze text. The AI model might be overloaded or the input text is not processable.");
  }
}

export async function generatePanelImage(prompt: string, quality: ImageQuality, aspectRatio: AspectRatio): Promise<string> {
   try {
    let finalPrompt = prompt;
    switch(quality) {
        case 'high':
            finalPrompt += ", masterpiece, 4k, ultra-detailed, sharp focus";
            break;
        case 'low':
            finalPrompt += ", sketch, simple style, quick drawing, rough lines";
            break;
        case 'medium':
        default:
            // No additions for medium quality
            break;
    }
    
    // NOTE: While the Imagen API has features like 'subject_reference' in more advanced SDKs (like Vertex AI),
    // this basic API call relies on highly descriptive prompts for consistency.
    // The character descriptions generated in the 'Character Sheet' step are injected into the prompt
    // before this function is called to maintain visual continuity.
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
        throw new Error("Image generation failed, no images returned.");
    }
    
    return response.generatedImages[0].image.imageBytes;

   } catch (error) {
    console.error("Error generating image with Imagen:", error);
    throw new Error(`Failed to generate image for prompt: "${prompt.substring(0, 50)}..."`);
   }
}

export async function generateCharacterSheet(characterName: string, context: string): Promise<{ description: string; imageUrl: string }> {
    // Note: Prompts for character sheet generation remain in English
    // to ensure the image generation model receives stylistically consistent instructions.
    const descriptionPrompt = `
        Based on the following text, create a concise but detailed visual description of the character "${characterName}". 
        Focus on physical traits, clothing, hair, and any defining features mentioned. This description will be used to ensure visual consistency in an AI image generator.
        Output only the description string.

        CONTEXT:
        ${context}
    `;

    const descriptionResponse = await ai.models.generateContent({
        model: textModel,
        contents: descriptionPrompt,
    });
    const description = descriptionResponse.text.trim();

    const imagePrompt = `
        Character sheet, full body portrait of ${characterName}, standing, neutral background.
        Style: In the style of 90s cel-shaded American comics, thick line weight, flat colors.
        Description: ${description}
    `;
    const imageBytes = await generatePanelImage(imagePrompt, 'high', '1:1');
    
    return { description, imageUrl: `data:image/jpeg;base64,${imageBytes}` };
}
