import { GoogleGenAI, Type, GenerateContentResponse, Modality, Operation } from '@google/genai';
import type { Scene, ImageQuality, AspectRatio, ArtStyle } from '../types';
import { translations } from './translations';

if (!process.env.API_KEY) {
  throw new Error('API_KEY environment variable not set');
}

// FIX: Initialize the GoogleGenAI instance.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const textModel = 'gemini-2.5-pro';
const imageModel = 'imagen-4.0-generate-001';
const videoModel = 'veo-3.1-fast-generate-preview';
const ttsModel = 'gemini-2.5-flash-preview-tts';

// --- NEW: Cooldown state for API rate limiting ---
let isApiCoolingDown = false;
let coolDownUntil = 0;
const COOL_DOWN_PERIOD_MS = 60 * 1000; // 1 minute cooldown

/**
 * Checks if the API is in a cooldown state. If so, throws an error
 * to prevent further requests until the cooldown period has passed.
 */
function checkApiCooldown() {
  if (isApiCoolingDown) {
    if (Date.now() < coolDownUntil) {
      const timeLeft = Math.ceil((coolDownUntil - Date.now()) / 1000);
      throw new Error(`The AI service is temporarily unavailable due to high request volume. Please try again in about ${timeLeft} seconds.`);
    } else {
      isApiCoolingDown = false; // Cooldown period has passed, reset the flag
      coolDownUntil = 0;
    }
  }
}


// --- NEW: Centralized Error Handling ---

/**
 * Parses errors from the Gemini API and returns a user-friendly message.
 * @param error The error object.
 * @param context A string describing the operation that failed (e.g., 'image generation').
 * @returns A user-friendly error string.
 */
function getFriendlyErrorMessage(error: unknown, context: string): string {
  console.error(`Error during ${context}:`, error);

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('api key not valid')) {
      return 'Authentication Failed: Your API key is invalid. Please ensure it is configured correctly in your environment.';
    }
    
    // Updated to trigger cooldown
    if (message.includes('429') || message.includes('rate limit') || message.includes('billing') || message.includes('quota')) {
      isApiCoolingDown = true;
      coolDownUntil = Date.now() + COOL_DOWN_PERIOD_MS;
      return `API Limit Reached: You've exceeded your usage quota or rate limit. To prevent further errors, API requests will be paused for one minute. Please check your Google AI Studio billing settings. (Context: ${context})`;
    }

    if (message.includes('blockreason') || message.includes('blocked')) {
      const reason =
        error.message.split('Reason: ')[1]?.toLowerCase() || 'safety filters';
      return `Content generation was blocked by ${reason}. Please revise your text or prompt. (Context: ${context})`;
    }

    if (message.includes('failed to fetch') || message.includes('network')) {
      return `Network Error: Could not connect to the AI service. Please check your internet connection. (Context: ${context})`;
    }
    if (message.includes('requested entity was not found')) {
      return `API Key Error: The selected API key was not found or is invalid. Please select a valid key. (Context: ${context})`
    }

    return `An AI service error occurred during ${context}: ${error.message}`;
  }

  return `An unknown error occurred while communicating with the AI service during ${context}.`;
}

/**
 * Checks a successful GenerateContentResponse for content blocks.
 * Throws an error if the response was blocked.
 * @param response The response from the Gemini API.
 */
function checkResponseForBlock(response: GenerateContentResponse): void {
  if (response.promptFeedback?.blockReason) {
    throw new Error(
      `Content generation was blocked. Reason: ${response.promptFeedback.blockReason}`,
    );
  }
}

const sceneSchema = {
  type: Type.OBJECT,
  properties: {
    originalText: { type: Type.STRING },
    summary: { type: Type.STRING },
    characters: { type: Type.ARRAY, items: { type: Type.STRING } },
    props: { type: Type.ARRAY, items: { type: Type.STRING } },
    dialogue: { type: Type.STRING },
    visualPrompt: { type: Type.STRING },
    // The Gemini API is more reliable with NUMBER for integer-like values in schemas.
    actionScore: { type: Type.NUMBER },
  },
  required: [
    'originalText',
    'summary',
    'characters',
    'props',
    'dialogue',
    'visualPrompt',
    'actionScore',
  ],
};

export async function segmentTextIntoScenes(
  text: string,
  lang: 'en' | 'de',
): Promise<string[]> {
  checkApiCooldown();
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

    checkResponseForBlock(response);

    const jsonString = response.text.trim();
    let sceneTexts: string[];
    try {
      sceneTexts = JSON.parse(jsonString) as string[];
    } catch (parseError) {
      throw new Error(
        'AI model returned an invalid data format. Could not parse scene texts.',
      );
    }

    if (
      !Array.isArray(sceneTexts) ||
      !sceneTexts.every((item) => typeof item === 'string')
    ) {
      throw new Error(
        'AI model returned an invalid data format for scene texts.',
      );
    }

    return sceneTexts;
  } catch (error: unknown) {
    throw new Error(getFriendlyErrorMessage(error, 'scene segmentation'));
  }
}

export async function analyzeIndividualScene(
  sceneText: string,
  lang: 'en' | 'de',
): Promise<Scene> {
  checkApiCooldown();
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
    7. "props": ${t('propsPrompt')}
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

    checkResponseForBlock(response);

    const jsonString = response.text.trim();
    let scene: Scene;
    try {
      scene = JSON.parse(jsonString) as Scene;
    } catch (parseError) {
      throw new Error(
        'AI model returned an invalid data format. Could not parse scene analysis.',
      );
    }

    // Ensure the originalText is what we sent, as the model can sometimes alter it.
    scene.originalText = sceneText;

    return scene;
  } catch (error: unknown) {
    throw new Error(getFriendlyErrorMessage(error, 'scene analysis'));
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
  checkApiCooldown();
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
      throw new Error(
        'Image generation failed: The AI model did not return an image.',
      );
    }

    return response.generatedImages[0].image.imageBytes;
  } catch (error: unknown) {
    throw new Error(getFriendlyErrorMessage(error, 'image generation'));
  }
}

export async function generateSpeech(text: string, voiceName: string): Promise<string> {
  checkApiCooldown();
  try {
    const response = await ai.models.generateContent({
        model: ttsModel,
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
          },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('TTS generation failed: No audio data returned.');
    }
    return base64Audio;
  } catch (error: unknown) {
    throw new Error(getFriendlyErrorMessage(error, 'speech generation'));
  }
}

export async function generatePanelVideo(prompt: string, aspectRatio: AspectRatio) {
    checkApiCooldown();
    // A new AI instance is created here to ensure the latest API key from the selection dialog is used.
    const videoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const operation = await videoAi.models.generateVideos({
            model: videoModel,
            prompt: `cinematic loop, ${prompt}`,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio,
            }
        });
        return operation;
    } catch (error: unknown) {
        throw new Error(getFriendlyErrorMessage(error, 'video generation'));
    }
}

export async function pollVideoOperation(operation: Operation) {
    checkApiCooldown();
    const videoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        return await videoAi.operations.getVideosOperation({ operation });
    } catch (error: unknown) {
        throw new Error(getFriendlyErrorMessage(error, 'video status check'));
    }
}

const translate = (
  lang: 'en' | 'de',
  key: keyof typeof translations.en.gemini,
  replacements?: { [key: string]: string | number },
) => {
  let text = translations[lang].gemini[key] || translations.en.gemini[key];
  if (replacements) {
    Object.entries(replacements).forEach(([placeholder, value]) => {
      text = text.replace(`{{${placeholder}}}`, String(value));
    });
  }
  return text;
};

type WorldAssetType = 'character' | 'location' | 'prop';

const assetConfigs = {
  character: {
    descriptionPromptKey: 'characterDescriptionPrompt' as keyof typeof translations.en.gemini,
    imagePromptTemplate: (name: string, description: string) => `Character sheet, full body portrait of ${name}, standing, neutral background.\nDescription: ${description}`,
    imageAspectRatio: '1:1' as AspectRatio,
    imageNegativePrompt: 'text, signature, watermark',
  },
  location: {
    descriptionPromptKey: 'locationDescriptionPrompt' as keyof typeof translations.en.gemini,
    imagePromptTemplate: (name: string, description: string) => `Concept art of a location: ${name}. Establishing shot, wide angle.\nDescription: ${description}`,
    imageAspectRatio: '16:9' as AspectRatio,
    imageNegativePrompt: 'characters, people, text, signature, watermark',
  },
  prop: {
    descriptionPromptKey: 'propDescriptionPrompt' as keyof typeof translations.en.gemini,
    imagePromptTemplate: (name: string, description: string) => `Concept art of a prop or item: ${name}. Centered, detailed, neutral background.\nDescription: ${description}`,
    imageAspectRatio: '1:1' as AspectRatio,
    imageNegativePrompt: 'characters, people, text, signature, watermark, complex background',
  },
};

const generateWorldAssetSheet = async (
  assetType: WorldAssetType,
  assetName: string,
  context: string,
  lang: 'en' | 'de',
): Promise<{ description: string; imageUrl: string }> => {
  checkApiCooldown();
  const config = assetConfigs[assetType];
  const nameProperty = `${assetType}Name`;

  try {
    const descriptionPrompt = `
    ${translate('en', config.descriptionPromptKey, { [nameProperty]: assetName })}
    CONTEXT:
    ${context}
  `;

    const descriptionResponse = await ai.models.generateContent({
      model: textModel,
      contents: descriptionPrompt,
    });
    checkResponseForBlock(descriptionResponse);
    const description = descriptionResponse.text.trim();

    const imagePrompt = config.imagePromptTemplate(assetName, description);
    
    const imageBytes = await generatePanelImage(
      imagePrompt,
      'high',
      config.imageAspectRatio,
      'default',
      config.imageNegativePrompt,
    );

    return { description, imageUrl: `data:image/jpeg;base64,${imageBytes}` };
  } catch (error: unknown) {
    throw new Error(
      getFriendlyErrorMessage(
        error,
        `generating sheet for ${assetType} "${assetName}"`,
      ),
    );
  }
};


export async function generateCharacterSheet(
  characterName: string,
  context: string,
  lang: 'en' | 'de',
): Promise<{ description: string; imageUrl: string }> {
  return generateWorldAssetSheet('character', characterName, context, lang);
}

export async function generateLocationSheet(
  locationName: string,
  context: string,
  lang: 'en' | 'de',
): Promise<{ description: string; imageUrl: string }> {
  return generateWorldAssetSheet('location', locationName, context, lang);
}

export async function generatePropSheet(
  propName: string,
  context: string,
  lang: 'en' | 'de',
): Promise<{ description: string; imageUrl: string }> {
  return generateWorldAssetSheet('prop', propName, context, lang);
}

export async function generatePoseImage(
    characterName: string,
    characterDescription: string,
    poseDescription: string,
    lang: 'en' | 'de',
  ): Promise<{ imageUrl: string }> {
    checkApiCooldown();
    try {
      // Prompts are always in English for better model performance
      const imagePrompt = translate('en', 'poseImagePrompt', {
        characterName,
        characterDescription,
        poseDescription,
      });

      const imageBytes = await generatePanelImage(
        imagePrompt,
        'high',
        '1:1', // Poses are good as squares
        'default',
        'text, signature, watermark, multiple characters, complex background',
      );

      return { imageUrl: `data:image/jpeg;base64,${imageBytes}` };
    } catch (error: unknown) {
      throw new Error(
        getFriendlyErrorMessage(
          error,
          `generating pose for character "${characterName}"`,
        ),
      );
    }
}