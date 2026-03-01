import {
  GoogleGenAI,
  Type,
  GenerateContentResponse,
  Modality,
  Operation,
  SafetySetting,
  HarmCategory,
  GenerateContentParameters,
} from '@google/genai';
import type {
  Scene,
  ImageQuality,
  AspectRatio,
  ArtStyle,
  AdvancedGenerationSettings,
  GenerateImageConfig,
  VideoSettings,
  WordCloudAnalysis,
  ImageModel,
} from '../types';
import { translations } from './translations';
import { loadGeminiApiKeyDecrypted } from './secureKeyStore';

async function getApiKeyOrThrow(): Promise<string> {
  const apiKey = await loadGeminiApiKeyDecrypted();
  if (!apiKey) {
    throw new Error(
      'No Gemini API key configured. Please add your key in Settings. Keys are stored encrypted on this device.',
    );
  }
  return apiKey;
}

async function getAiClient(): Promise<GoogleGenAI> {
  const apiKey = await getApiKeyOrThrow();
  return new GoogleGenAI({ apiKey });
}

// --- Centralized Model Configuration ---
const MODELS = {
  text: 'gemini-3-pro-preview', 
  image: {
    default: 'gemini-3-pro-image-preview',
    nano: 'gemini-2.5-flash-image',
    legacy: 'imagen-4.0-generate-001'
  },
  video: 'veo-3.1-fast-generate-preview',
  tts: 'gemini-2.5-flash-preview-tts',
};

// --- Advanced API Configuration ---
const DEFAULT_SAFETY_SETTINGS: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
];

const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 2000,
  maxDelayMs: 10000,
};

// --- Helper for JSON Parsing ---
function cleanJsonString(jsonStr: string): string {
  // Remove markdown code blocks if present
  let cleaned = jsonStr.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  return cleaned.trim();
}

// --- State-of-the-Art Error Handling & Retry Logic ---

let isApiCoolingDown = false;
let coolDownUntil = 0;
const COOL_DOWN_PERIOD_MS = 60 * 1000;

function checkApiCooldown() {
  if (isApiCoolingDown) {
    if (Date.now() < coolDownUntil) {
      const timeLeft = Math.ceil((coolDownUntil - Date.now()) / 1000);
      throw new Error(
        `The AI service is temporarily unavailable due to high request volume. Please try again in about ${timeLeft} seconds.`,
      );
    } else {
      isApiCoolingDown = false;
      coolDownUntil = 0;
    }
  }
}

function getFriendlyErrorMessage(error: unknown, context: string): string {
  console.error(`Error during ${context}:`, error);

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('api key not valid')) {
      return 'Authentication Failed: Your API key is invalid. Please ensure it is configured correctly.';
    }
    if (message.includes('429') || message.includes('rate limit') || message.includes('resource exhausted')) {
      isApiCoolingDown = true;
      coolDownUntil = Date.now() + COOL_DOWN_PERIOD_MS;
      return `API Limit Reached: You've exceeded your usage quota. To protect the service, API requests are paused for one minute. Please check your Google AI Studio settings. (Context: ${context})`;
    }
    if (message.includes('billing') || message.includes('quota')) {
        return `Billing/Quota Error: Please check your Google Cloud project's billing status and API quotas. (Context: ${context})`;
    }
    if (message.includes('blockreason') || message.includes('safety')) {
      const reason = error.message.match(/Reason: (\w+)/)?.[1]?.toLowerCase() || 'safety filters';
      return `Content generation was blocked due to ${reason}. Please revise your prompt. (Context: ${context})`;
    }
    if (message.includes('failed to fetch') || message.includes('network')) {
      return `Network Error: Could not connect to the AI service. Please check your internet connection. (Context: ${context})`;
    }
    if (message.includes('requested entity was not found')) {
      return `API Key Error: The selected API key was not found or is invalid. Please select a valid key. (Context: ${context})`;
    }
    if (message.includes('request failed with status code 500') || message.includes('internal error')) {
        return `AI Service Error: The service encountered a temporary internal error. Please try again in a moment. (Context: ${context})`;
    }

    return `An AI service error occurred during ${context}: ${error.message}`;
  }
  return `An unknown error occurred during ${context}.`;
}

/**
 * A sophisticated wrapper for API calls that includes exponential backoff with jitter for retries.
 * @param apiCall The async function to call.
 * @param context A string describing the operation for error logging.
 * @returns The result of the API call.
 */
async function makeApiRequest<T>(
  apiCall: () => Promise<T>,
  context: string,
): Promise<T> {
  checkApiCooldown();
  let lastError: unknown = new Error('API request failed after all retries.');

  for (let i = 0; i < RETRY_CONFIG.maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error: unknown) {
      lastError = error;
      const errorMessage = (error instanceof Error) ? error.message.toLowerCase() : '';
      
      // Only retry on specific transient errors
      const isRetryable = errorMessage.includes('429') || // Rate limit
                          errorMessage.includes('500') || // Server error
                          errorMessage.includes('503') || // Service unavailable
                          errorMessage.includes('network') ||
                          errorMessage.includes('failed to fetch');

      if (isRetryable && i < RETRY_CONFIG.maxRetries - 1) {
        const delay = Math.min(RETRY_CONFIG.initialDelayMs * Math.pow(2, i), RETRY_CONFIG.maxDelayMs);
        const jitter = delay * 0.2 * Math.random(); // Add jitter to avoid thundering herd
        console.warn(`Retryable error in ${context}. Retrying in ${Math.round((delay + jitter)/1000)}s... (Attempt ${i + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay + jitter));
      } else {
        // For non-retryable errors or after max retries, throw a friendly error
        throw new Error(getFriendlyErrorMessage(error, context));
      }
    }
  }
  throw lastError; // Should not be reached, but satisfies TypeScript
}


function checkResponseForBlock(response: GenerateContentResponse): void {
  if (response.promptFeedback?.blockReason) {
    throw new Error(`Content generation was blocked. Reason: ${response.promptFeedback.blockReason}`);
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
    actionScore: { type: Type.NUMBER },
  },
  required: ['originalText', 'summary', 'characters', 'props', 'dialogue', 'visualPrompt', 'actionScore'],
};

export async function segmentTextIntoScenes(text: string, lang: 'en' | 'de'): Promise<string[]> {
  const ai = await getAiClient();
  const t = (key: keyof typeof translations.en.gemini) => translations[lang].gemini[key] || translations.en.gemini[key];
  const systemInstruction = t('sceneSegmentationPreamble');
  const prompt = `---TEXT---\n${text}\n---`;

  const response = await makeApiRequest<GenerateContentResponse>(() => ai.models.generateContent({
    model: MODELS.text,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
      temperature: 0.1,
    },
    safetySettings: DEFAULT_SAFETY_SETTINGS,
  }), 'scene segmentation');

  checkResponseForBlock(response);
  const jsonString = cleanJsonString(response.text.trim());
  try {
    const sceneTexts = JSON.parse(jsonString) as string[];
    if (!Array.isArray(sceneTexts) || !sceneTexts.every(item => typeof item === 'string')) {
      throw new Error('AI model returned an invalid data format for scene texts.');
    }
    return sceneTexts;
  } catch (parseError) {
    console.error("Failed to parse scene texts JSON:", jsonString);
    throw new Error('AI model returned an invalid data format. Could not parse scene texts.');
  }
}

export async function analyzeIndividualScene(sceneText: string, lang: 'en' | 'de'): Promise<Scene> {
  const ai = await getAiClient();
  const t = (key: keyof typeof translations.en.gemini) => translations[lang].gemini[key] || translations.en.gemini[key];
  const systemInstruction = `${t('sceneAnalysisPreamble')}
    1. "originalText": ${t('originalTextPrompt')}
    2. "summary": ${t('summaryPrompt')}
    3. "characters": ${t('charactersPrompt')}
    4. "dialogue": ${t('dialoguePrompt')}
    5. "visualPrompt": ${t('visualPromptPrompt')}
    6. "actionScore": ${t('actionScorePrompt')}
    7. "props": ${t('propsPrompt')}
  `;
  const prompt = `---SCENE TEXT---\n${sceneText}\n---`;
  
  const response = await makeApiRequest<GenerateContentResponse>(() => ai.models.generateContent({
    model: MODELS.text,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: sceneSchema,
      temperature: 0.2,
    },
    safetySettings: DEFAULT_SAFETY_SETTINGS,
  }), 'scene analysis');
  
  checkResponseForBlock(response);
  const jsonString = cleanJsonString(response.text.trim());
  try {
    const scene = JSON.parse(jsonString) as Scene;
    scene.originalText = sceneText; // Ensure original text is preserved
    return scene;
  } catch (parseError) {
    console.error("Failed to parse scene analysis JSON:", jsonString);
    throw new Error('AI model returned an invalid data format. Could not parse scene analysis.');
  }
}

const getStylePrompts = (style: ArtStyle): { stylePrompt: string; negativePrompt: string } => {
  const defaultNegative = 'ugly, deformed, disfigured, poor anatomy, bad hands, extra limbs, blurry, text, watermark, signature, jpeg artifacts, low resolution, boring, flat';
  const presetStyles: Record<string, { stylePrompt: string; negativePrompt: string }> = {
    manga: {
      stylePrompt: 'in a black and white manga style, detailed line art with screentones, dynamic action lines, expressive faces, dramatic paneling, ',
      negativePrompt: 'color, realistic, photo, painting',
    },
    noir: {
      stylePrompt: 'in a high-contrast black and white film noir style, dramatic chiaroscuro lighting, deep shadows, film grain, 1940s aesthetic, sharp angles, ',
      negativePrompt: 'bright colors, cheerful, soft lighting',
    },
    watercolor: {
      stylePrompt: 'in a soft watercolor painting style, with vibrant color washes, bleeding edges, visible paper texture, loose and expressive lines, ',
      negativePrompt: 'photorealistic, hard edges, flat colors, 3d render',
    },
    cyberpunk: {
      stylePrompt: 'in a neon-drenched cyberpunk art style, futuristic city with glowing advertisements, rain-slicked streets, high-tech low-life aesthetic, detailed cybernetics, ',
      negativePrompt: 'natural, rural, historical, pastel colors',
    },
    default: {
      stylePrompt: 'in the style of 90s American comics, dynamic and energetic, cel-shaded with thick outlines, bold flat colors, and dramatic cross-hatching for shadows, Kirby dots, ',
      negativePrompt: 'realistic, painterly, soft, muted colors',
    },
  };
  
  const selectedStyle = presetStyles[style];
  if (selectedStyle) {
    return {
      stylePrompt: selectedStyle.stylePrompt,
      negativePrompt: `${defaultNegative}, ${selectedStyle.negativePrompt}`,
    };
  }

  // Handle custom styles
  return {
    stylePrompt: `in the art style of ${style}, `,
    negativePrompt: defaultNegative,
  };
};

interface GenerateImagesResponse {
  generatedImages: {
    image: {
      imageBytes: string;
    };
  }[];
}

export async function generatePanelImage(
  prompt: string, 
  quality: ImageQuality, 
  aspectRatio: AspectRatio, 
  artStyle: ArtStyle,
  negativePrompt: string, 
  advancedSettings: AdvancedGenerationSettings,
  modelPreference: ImageModel = 'gemini-3-pro' // Default to Gemini 3 Pro
): Promise<string> {
  const ai = await getAiClient();
  
  const { stylePrompt, negativePrompt: styleNegativePrompt } = getStylePrompts(artStyle);
  let finalPrompt = `Dynamic comic book panel art, ${stylePrompt}${prompt}`;
  
  const qualityPrompts: Record<ImageQuality, string> = {
    high: ', masterpiece, 4k, ultra-detailed, sharp focus, cinematic composition, professional illustration',
    medium: ', detailed, clear illustration, well-composed',
    low: ', simple sketch, rough lines, quick drawing, concept art',
  };
  finalPrompt += qualityPrompts[quality];

  let finalNegativePrompt = styleNegativePrompt;
  if (negativePrompt && negativePrompt.trim() !== '') {
    finalNegativePrompt += `, ${negativePrompt.trim()}`;
  }
  
  // Configure the request based on the selected model
  // 1. Imagen Model (Legacy/Control)
  if (modelPreference === 'imagen-4') {
      finalPrompt += `. Do not include: ${finalNegativePrompt}`;

      const config: GenerateImageConfig = {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
        ...advancedSettings
      };
      if (advancedSettings.seed === null) {
        delete config.seed;
      }

      const response = await makeApiRequest<GenerateImagesResponse>(() => ai.models.generateImages({
        model: MODELS.image.legacy,
        prompt: finalPrompt,
        config,
      }), 'image generation (Imagen 4)');

      if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error('Image generation failed: The AI model did not return an image.');
      }
      return response.generatedImages[0].image.imageBytes;
  } 
  
  // 2. Gemini Models (Nano Banana & Gemini 3 Pro)
  else {
      // Add negative prompt instruction to the main prompt as gemini-2.5-flash-image doesn't support negativePrompt parameter yet in this SDK version effectively
      // or it's handled better in natural language for the multi-modal models.
      finalPrompt += `\n\n(Avoid: ${finalNegativePrompt})`;
      
      const modelName = modelPreference === 'nano-banana' ? MODELS.image.nano : MODELS.image.default;
      const isHighQuality = modelPreference === 'gemini-3-pro';

      const config: GenerateContentParameters['config'] = {};
      
      if (isHighQuality) {
         // Configuration specific to Gemini 3 Pro Image
          config.imageConfig = {
             aspectRatio: aspectRatio,
             imageSize: "2K" // Gemini 3 Pro supports high res
          };
      } 
      
      // "Nano Banana" (Flash Image) usually doesn't take explicit aspect ratio config in the same way as Imagen 
      // via the unified SDK yet, but we can try prompt engineering or specific config if available.
      // For now, relying on the strong prompt instruction for aspect ratio if strict config fails.
      if (!isHighQuality) {
          finalPrompt += ` Aspect Ratio: ${aspectRatio.replace(':', ' to ')}.`;
      }

      const response = await makeApiRequest<GenerateContentResponse>(() => ai.models.generateContent({
          model: modelName,
          contents: {
              parts: [{ text: finalPrompt }]
          },
          config: config
      }), `image generation (${modelName})`);
      
      // Extract image from response
      if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                  return part.inlineData.data;
              }
          }
      }
      
      throw new Error('Image generation failed: No image data found in response.');
  }
}

export async function generateSpeech(text: string, voiceName: string): Promise<string> {
  const ai = await getAiClient();
  const response = await makeApiRequest<GenerateContentResponse>(() => ai.models.generateContent({
    model: MODELS.tts,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
    },
  }), 'speech generation');
  
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error('TTS generation failed: No audio data returned.');
  }
  return base64Audio;
}

export async function generatePanelVideo(prompt: string, aspectRatio: AspectRatio, videoSettings: VideoSettings) {
  const videoAi = await getAiClient();
  let finalPrompt = `cinematic loop, ${prompt}`;
  const motionPrompts = {
      low: 'subtle movement, slow motion, ',
      medium: '',
      high: 'high action, fast paced, dynamic movement, '
  };
  finalPrompt = motionPrompts[videoSettings.motion] + finalPrompt;

  return makeApiRequest<Operation>(() => videoAi.models.generateVideos({
    model: MODELS.video,
    prompt: finalPrompt,
    config: {
      numberOfVideos: 1,
      resolution: videoSettings.resolution,
      aspectRatio: aspectRatio,
    },
  }), 'video generation');
}

export async function pollVideoOperation(operation: Operation) {
  const videoAi = await getAiClient();
  return makeApiRequest<Operation>(() => videoAi.operations.getVideosOperation({ operation }), 'video status check');
}

export async function getAuthenticatedUrl(url: string): Promise<string> {
  const apiKey = await getApiKeyOrThrow();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}key=${encodeURIComponent(apiKey)}`;
}

const translate = (lang: 'en' | 'de', key: keyof typeof translations.en.gemini, replacements?: { [key: string]: string | number }) => {
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
    imagePromptTemplate: (name: string, description: string) => `Character model sheet for concept art, full body portrait of ${name} in a neutral T-pose, plain background. Style: detailed digital painting, clean lines. Description: ${description}`,
    imageAspectRatio: '1:1' as AspectRatio,
    imageNegativePrompt: 'text, signature, watermark, multiple characters, complex background, blurry',
  },
  location: {
    descriptionPromptKey: 'locationDescriptionPrompt' as keyof typeof translations.en.gemini,
    imagePromptTemplate: (name: string, description: string) => `Environment concept art of a location: ${name}. Establishing shot, wide angle, cinematic lighting, detailed. Style: professional digital painting. Description: ${description}`,
    imageAspectRatio: '16:9' as AspectRatio,
    imageNegativePrompt: 'characters, people, text, signature, watermark, blurry',
  },
  prop: {
    descriptionPromptKey: 'propDescriptionPrompt' as keyof typeof translations.en.gemini,
    imagePromptTemplate: (name: string, description: string) => `Prop design sheet, concept art of an item: ${name}. Centered, detailed, multiple angles if possible, orthographic view, neutral background. Style: detailed digital painting. Description: ${description}`,
    imageAspectRatio: '1:1' as AspectRatio,
    imageNegativePrompt: 'characters, people, text, signature, watermark, complex background, blurry',
  },
};

const generateWorldAssetSheet = async (
  assetType: WorldAssetType, assetName: string, context: string, lang: 'en' | 'de'
): Promise<{ description: string; imageUrl: string }> => {
  const ai = await getAiClient();
  const config = assetConfigs[assetType];
  const nameProperty = `${assetType}Name`;

  const descriptionSystemInstruction = translate(lang, config.descriptionPromptKey, { [nameProperty]: assetName });
  
  // Use Gemini 3 Pro for high quality descriptions
  const descriptionResponse = await makeApiRequest<GenerateContentResponse>(() => ai.models.generateContent({
      model: MODELS.text,
      contents: `CONTEXT:\n${context}`,
      config: { systemInstruction: descriptionSystemInstruction },
      safetySettings: DEFAULT_SAFETY_SETTINGS
  }), `generating ${assetType} description`);
  
  checkResponseForBlock(descriptionResponse);
  const description = descriptionResponse.text.trim();

  const imagePrompt = config.imagePromptTemplate(assetName, description);

  // Use Gemini 3 Pro Image for high quality asset sheets
  const imageBytes = await generatePanelImage(
    imagePrompt, 'high', config.imageAspectRatio, 'default', config.imageNegativePrompt,
    { seed: 12345, temperature: 0.8, topK: 40, topP: 0.95 },
    'gemini-3-pro'
  );

  return { description, imageUrl: `data:image/jpeg;base64,${imageBytes}` };
};

export async function generateCharacterSheet(characterName: string, context: string, lang: 'en' | 'de') {
  return generateWorldAssetSheet('character', characterName, context, lang);
}
export async function generateLocationSheet(locationName: string, context: string, lang: 'en' | 'de') {
  return generateWorldAssetSheet('location', locationName, context, lang);
}
export async function generatePropSheet(propName: string, context: string, lang: 'en' | 'de') {
  return generateWorldAssetSheet('prop', propName, context, lang);
}

export async function generatePoseImage(characterName: string, characterDescription: string, poseDescription: string): Promise<{ imageUrl: string }> {
    const imagePrompt = `Full body portrait of the character "${characterName}".
    Base Character Description: ${characterDescription}.
    The character MUST be depicted with this specific pose and expression: ${poseDescription}.
    Style: character reference sheet, clean lines, neutral background, centered, dynamic pose.`;
    
    // Use Nano Banana for poses as speed is often preferred for iterative pose generation, 
    // or stick to Gemini 3 Pro for quality consistency. Let's use Gemini 3 Pro for consistency.
    const imageBytes = await generatePanelImage(
      imagePrompt, 'high', '1:1', 'default',
      'text, signature, watermark, multiple characters, complex background',
      { seed: null, temperature: 0.8, topK: 40, topP: 0.95 },
      'gemini-3-pro'
    );
    return { imageUrl: `data:image/jpeg;base64,${imageBytes}` };
}

const wordCloudSchema = { type: Type.OBJECT, properties: { text: { type: Type.STRING }, size: { type: Type.NUMBER } }, required: ['text', 'size'] };
const wordCloudAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    overall: { type: Type.ARRAY, items: wordCloudSchema },
    characters: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, words: { type: Type.ARRAY, items: wordCloudSchema } }, required: ['name', 'words'] } },
    locations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, words: { type: Type.ARRAY, items: wordCloudSchema } }, required: ['name', 'words'] } },
    events: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, words: { type: Type.ARRAY, items: wordCloudSchema } }, required: ['name', 'words'] } },
  },
  required: ['overall', 'characters', 'locations', 'events'],
};

export async function generateWordCloudAnalysis(text: string, lang: 'en' | 'de'): Promise<WordCloudAnalysis> {
  const ai = await getAiClient();
  const systemInstruction = translate(lang, 'wordCloudAnalysisPrompt');
  const prompt = `---TEXT---\n${text}\n---`;

  const response = await makeApiRequest<GenerateContentResponse>(() => ai.models.generateContent({
    model: MODELS.text,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: wordCloudAnalysisSchema,
      temperature: 0.3,
    },
    safetySettings: DEFAULT_SAFETY_SETTINGS,
  }), 'word cloud analysis');

  checkResponseForBlock(response);
  const jsonString = cleanJsonString(response.text.trim());
  try {
    return JSON.parse(jsonString) as WordCloudAnalysis;
  } catch (parseError) {
    console.error("Failed to parse word cloud analysis JSON:", jsonString);
    throw new Error('AI model returned an invalid data format. Could not parse word cloud analysis.');
  }
}