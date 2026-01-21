/**
 * License Plate Recognition Service
 * 
 * This service handles license plate detection using Plate Recognizer API.
 * Uses FormData multipart upload for reliable image transfer in React Native.
 */

export interface PlateRecognitionResult {
  plateNumber: string | null;
  confidence: number;
  region?: string;
  error?: string;
}

const PLATE_RECOGNIZER_API_KEY = '4d1eeb58d6f84e96aaaa9a6d12b9894b63dd44ca';
const API_URL = 'https://api.platerecognizer.com/v1/plate-reader/';

/**
 * Extract license plate from image using Plate Recognizer API
 * Uses FormData multipart upload - most reliable method for React Native
 * 
 * @param imageUri - Local file URI from ImagePicker (e.g., file:///path/to/image.jpg)
 * @returns Promise with the recognition result
 */
export async function recognizePlateFromUri(imageUri: string): Promise<PlateRecognitionResult> {
  try {
    if (!imageUri) {
      return { plateNumber: null, confidence: 0, error: 'No image URI provided' };
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    
    // Extract filename from URI
    const uriParts = imageUri.split('/');
    const fileName = uriParts[uriParts.length - 1] || 'photo.jpg';
    
    // Determine mime type from extension
    const extension = fileName.split('.').pop()?.toLowerCase();
    let mimeType = 'image/jpeg';
    if (extension === 'png') mimeType = 'image/png';
    else if (extension === 'heic' || extension === 'heif') mimeType = 'image/heic';
    
    // Append image file to FormData
    // React Native FormData requires this specific format
    formData.append('upload', {
      uri: imageUri,
      type: mimeType,
      name: fileName,
    } as any);
    
    // Add regions parameter
    formData.append('regions', 'gb');
    formData.append('regions', 'ie');
    formData.append('regions', 'us');
    formData.append('regions', 'fr');
    formData.append('regions', 'de');
    
    // Make API request with FormData
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${PLATE_RECOGNIZER_API_KEY}`,
        // Don't set Content-Type - fetch will set it automatically with boundary for FormData
      },
      body: formData,
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('[PlateRecognizer] API error:', response.status, responseText);
      return { plateNumber: null, confidence: 0, error: `API error: ${response.status}` };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[PlateRecognizer] JSON parse error:', parseError);
      return { plateNumber: null, confidence: 0, error: 'Invalid API response' };
    }

    // Check for API errors in response
    if (data.error) {
      console.error('[PlateRecognizer] API returned error:', data.error);
      return { plateNumber: null, confidence: 0, error: data.error };
    }

    // Check for results
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const plateNumber = result.plate?.toUpperCase() || null;
      const confidence = result.score || 0;
      const region = result.region?.code;

      if (plateNumber && confidence > 0.3) {
        return {
          plateNumber,
          confidence,
          region,
        };
      }
    }

    return { plateNumber: null, confidence: 0 };

  } catch (error: any) {
    console.error('[PlateRecognizer] Error:', error.message || error);
    return { plateNumber: null, confidence: 0, error: error.message || 'Unknown error' };
  }
}

// Keep old function name as alias for backward compatibility
export const recognizePlate = recognizePlateFromUri;
