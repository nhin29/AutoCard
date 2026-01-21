import * as FileSystemLegacy from 'expo-file-system/legacy';
import { supabase } from './supabase';

/**
 * Storage Service
 * 
 * Handles file uploads to Supabase Storage buckets:
 * - business-logos: Business profile logos
 * - profile-banners: User profile banner images
 * - ad-images: Vehicle/item listing images
 * - ad-stories: Story videos and images
 */

// ============================================
// TYPES
// ============================================

interface UploadResult {
  url: string | null;
  path: string | null;
  error: string | null;
}

interface MultiUploadResult {
  urls: string[];
  paths: string[];
  errors: string[];
}

type StorageBucket = 'business-logos' | 'profile-banners' | 'ad-images' | 'ad-stories';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get file extension from URI or filename
 */
function getFileExtension(uri: string): string {
  const parts = uri.split('.');
  const extension = parts[parts.length - 1].toLowerCase().split('?')[0];
  
  // Default to jpg if no valid extension found
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov'];
  return validExtensions.includes(extension) ? extension : 'jpg';
}

/**
 * Get MIME type from file extension
 */
function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
  };
  
  return mimeTypes[extension] || 'application/octet-stream';
}

/**
 * Generate unique filename for uploads
 */
function generateFileName(userId: string, extension: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const prefixStr = prefix ? `${prefix}_` : '';
  return `${userId}/${prefixStr}${timestamp}_${random}.${extension}`;
}

/**
 * Convert local file URI to blob for upload
 * Note: This function is currently not used but kept for potential future use
 */
async function uriToBlob(uri: string): Promise<Blob> {
  try {
    // Handle file:// URIs (common in React Native)
    // Fetch works with file:// URIs in React Native
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    return blob;
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error converting URI to blob';
    console.error('[Storage] Error converting URI to blob:', errorMessage);
    throw new Error(`Failed to convert URI to blob: ${errorMessage}`);
  }
}

/**
 * Read file as base64 using legacy API to avoid deprecation warnings
 * Falls back to fetch-based approach if legacy API fails
 */
async function readFileAsBase64(uri: string): Promise<string> {
  try {
    // Try using legacy API first (for compatibility)
    try {
      const base64 = await FileSystemLegacy.readAsStringAsync(uri, {
        encoding: FileSystemLegacy.EncodingType.Base64,
      });
      return base64;
    } catch (legacyError) {
      // Fallback: Use fetch to read file and convert to base64
      return await readFileAsBase64WithFetch(uri);
    }
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown error reading file';
    console.error('[Storage] Error reading file as base64:', errorMessage);
    throw error;
  }
}

/**
 * Alternative method: Read file using fetch and convert to base64
 * This is more reliable across different platforms
 */
async function readFileAsBase64WithFetch(uri: string): Promise<string> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix if present (data:image/jpeg;base64,)
        const base64 = base64String.includes(',') 
          ? base64String.split(',')[1] 
          : base64String;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error: any) {
    console.error('[Storage] Fetch-based base64 conversion error:', error);
    throw new Error(`Failed to read file: ${error?.message || 'Unknown error'}`);
  }
}

// ============================================
// UPLOAD FUNCTIONS
// ============================================

/**
 * Upload a single file to a storage bucket
 */
export async function uploadFile(
  bucket: StorageBucket,
  localUri: string,
  userId: string,
  options?: {
    prefix?: string;
    fileName?: string;
  }
): Promise<UploadResult> {
  try {
    // Validate inputs
    if (!localUri) {
      return { url: null, path: null, error: 'No file URI provided' };
    }

    if (!userId) {
      return { url: null, path: null, error: 'User ID is required' };
    }

    // Get file extension and generate path
    const extension = getFileExtension(localUri);
    const mimeType = getMimeType(extension);
    const filePath = options?.fileName || generateFileName(userId, extension, options?.prefix);

    // Read file as base64
    const base64Data = await readFileAsBase64(localUri);

    // Decode base64 to array buffer
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, bytes, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error('[Storage] Upload error:', error.message);
      return { url: null, path: null, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      error: null,
    };
  } catch (error: any) {
    const errorMessage = error?.message || error?.toString() || 'Unknown upload error';
    console.error('[Storage] Upload exception:', errorMessage);
    return { url: null, path: null, error: errorMessage };
  }
}

/**
 * Upload multiple files to a storage bucket
 */
export async function uploadMultipleFiles(
  bucket: StorageBucket,
  localUris: string[],
  userId: string,
  options?: {
    prefix?: string;
  }
): Promise<MultiUploadResult> {
  const urls: string[] = [];
  const paths: string[] = [];
  const errors: string[] = [];

  // Upload files in parallel with a concurrency limit
  const CONCURRENCY_LIMIT = 3;
  
  for (let i = 0; i < localUris.length; i += CONCURRENCY_LIMIT) {
    const batch = localUris.slice(i, i + CONCURRENCY_LIMIT);
    
    const results = await Promise.all(
      batch.map((uri, index) => 
        uploadFile(bucket, uri, userId, {
          prefix: options?.prefix ? `${options.prefix}_${i + index}` : `${i + index}`,
        })
      )
    );

    results.forEach((result) => {
      if (result.url && result.path) {
        urls.push(result.url);
        paths.push(result.path);
      }
      if (result.error) {
        errors.push(result.error);
      }
    });
  }

  return { urls, paths, errors };
}

// ============================================
// SPECIALIZED UPLOAD FUNCTIONS
// ============================================

/**
 * Upload business logo
 */
export async function uploadBusinessLogo(
  localUri: string,
  userId: string
): Promise<UploadResult> {
  return uploadFile('business-logos', localUri, userId, {
    prefix: 'logo',
  });
}

/**
 * Upload profile banner image
 */
export async function uploadProfileBanner(
  localUri: string,
  userId: string
): Promise<UploadResult> {
  return uploadFile('profile-banners', localUri, userId, {
    prefix: 'banner',
  });
}

/**
 * Upload ad images
 */
export async function uploadAdImages(
  localUris: string[],
  userId: string,
  adId?: string
): Promise<MultiUploadResult> {
  return uploadMultipleFiles('ad-images', localUris, userId, {
    prefix: adId || 'ad',
  });
}

/**
 * Upload ad story (video or image)
 */
export async function uploadAdStory(
  localUri: string,
  userId: string,
  adId?: string
): Promise<UploadResult> {
  return uploadFile('ad-stories', localUri, userId, {
    prefix: adId ? `story_${adId}` : 'story',
  });
}

/**
 * Upload multiple ad stories
 */
export async function uploadAdStories(
  localUris: string[],
  userId: string,
  adId?: string
): Promise<MultiUploadResult> {
  return uploadMultipleFiles('ad-stories', localUris, userId, {
    prefix: adId ? `story_${adId}` : 'story',
  });
}

// ============================================
// DELETE FUNCTIONS
// ============================================

/**
 * Delete a file from storage
 */
export async function deleteFile(
  bucket: StorageBucket,
  filePath: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('[Storage] Delete error:', error.message);
      return { error: error.message };
    }

    return { error: null };
  } catch (error: any) {
    console.error('[Storage] Delete exception:', error.message);
    return { error: error.message };
  }
}

/**
 * Delete multiple files from storage
 */
export async function deleteMultipleFiles(
  bucket: StorageBucket,
  filePaths: string[]
): Promise<{ errors: string[] }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(filePaths);

    if (error) {
      console.error('[Storage] Bulk delete error:', error.message);
      return { errors: [error.message] };
    }

    return { errors: [] };
  } catch (error: any) {
    console.error('[Storage] Bulk delete exception:', error.message);
    return { errors: [error.message] };
  }
}

/**
 * Delete all files in a user's folder
 */
export async function deleteUserFolder(
  bucket: StorageBucket,
  userId: string
): Promise<{ error: string | null }> {
  try {
    // List all files in user's folder
    const { data: files, error: listError } = await supabase.storage
      .from(bucket)
      .list(userId);

    if (listError) {
      console.error('[Storage] List folder error:', listError.message);
      return { error: listError.message };
    }

    if (!files || files.length === 0) {
      return { error: null };
    }

    // Delete all files
    const filePaths = files.map((file) => `${userId}/${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove(filePaths);

    if (deleteError) {
      console.error('[Storage] Delete folder error:', deleteError.message);
      return { error: deleteError.message };
    }

    return { error: null };
  } catch (error: any) {
    console.error('[Storage] Delete folder exception:', error.message);
    return { error: error.message };
  }
}

// ============================================
// URL HELPERS
// ============================================

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: StorageBucket, filePath: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Get signed URL for private file (with expiry)
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  filePath: string,
  expiresInSeconds: number = 3600
): Promise<{ url: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error) {
      console.error('[Storage] Signed URL error:', error.message);
      return { url: null, error: error.message };
    }

    return { url: data.signedUrl, error: null };
  } catch (error: any) {
    console.error('[Storage] Signed URL exception:', error.message);
    return { url: null, error: error.message };
  }
}

// ============================================
// EXPORTS
// ============================================

export const storageService = {
  uploadFile,
  uploadMultipleFiles,
  uploadBusinessLogo,
  uploadProfileBanner,
  uploadAdImages,
  uploadAdStory,
  uploadAdStories,
  deleteFile,
  deleteMultipleFiles,
  deleteUserFolder,
  getPublicUrl,
  getSignedUrl,
};

export default storageService;
