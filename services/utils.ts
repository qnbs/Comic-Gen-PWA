// This utility function converts a base64 string to a Blob object.
export const base64ToBlob = (base64: string, contentType = 'image/jpeg'): Blob => {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
};

export const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is a data URL: "data:image/jpeg;base64,..."
      // We only want the base64 part.
      resolve(result.split(',', 2)[1]);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });


export const hexToRgb = (
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

export const createThumbnail = (
  imageBlob: Blob,
  maxWidth = 300,
  quality = 0.85,
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }

      const aspectRatio = img.height / img.width;
      canvas.width = maxWidth;
      canvas.height = maxWidth * aspectRatio;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob failed to create a blob.'));
          }
        },
        'image/jpeg',
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for thumbnail generation.'));
    };

    img.src = url;
  });
};

// --- Centralized API Fetching Utilities ---

// FIX: Export 'robustFetch' so it can be used in other modules like dtaService.ts.
export async function robustFetch(url: string, options: RequestInit = {}, retries: number = 3, timeout: number = 30000): Promise<Response> {
    let lastError: unknown;
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(new DOMException('Request timed out', 'TimeoutError')), timeout);

            const response = await fetch(url, {
                ...options,
                mode: 'cors', // Explicitly set CORS mode for robustness
                referrerPolicy: 'no-referrer', // Added to potentially resolve CORS-like issues
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                if (response.status >= 500 || response.status === 429) {
                    throw new Error(`Retryable API error: status ${response.status}`);
                }
                throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
            }
            return response;
        } catch (error: unknown) {
            lastError = error;
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorName = error instanceof Error ? error.name : '';
            const isRetryable = errorMessage.includes('Failed to fetch') || errorName === 'AbortError' || errorName === 'TimeoutError' || errorMessage.includes('Retryable');
            if (isRetryable && i < retries - 1) {
                await new Promise(res => setTimeout(res, 1000 * Math.pow(2, i)));
            } else {
                throw lastError;
            }
        }
    }
    throw lastError || new Error('API request failed after all retries.');
}

export async function robustFetchJson<T>(url: string, options: RequestInit = {}, timeout?: number): Promise<T> {
    const response = await robustFetch(url, options, 3, timeout);
    return response.json() as T;
}

export async function robustFetchText(url: string, options: RequestInit = {}, timeout?: number): Promise<string> {
    const response = await robustFetch(url, options, 3, timeout);
    // Strict content-type check removed to support XML, JSON, and other text-based formats 
    // without artificial limitations. The caller is responsible for parsing validity.
    return response.text();
}