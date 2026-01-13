/**
 * Cloudinary Upload Service
 * Handles image uploads to Cloudinary
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

/**
 * Upload base64 image to Cloudinary
 */
export async function uploadToCloudinary(
  base64Data: string,
  folder: string = 'hoashop'
): Promise<CloudinaryUploadResult> {
  try {
    // Ensure base64Data has proper data URI format
    let imageData = base64Data;
    if (!imageData.startsWith('data:')) {
      imageData = `data:image/jpeg;base64,${imageData}`;
    }

    const result = await cloudinary.uploader.upload(imageData, {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Limit max size
        { quality: 'auto:good' }, // Auto quality optimization
      ],
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Upload failed');
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleToCloudinary(
  base64Images: string[],
  folder: string = 'hoashop'
): Promise<CloudinaryUploadResult[]> {
  const uploadPromises = base64Images.map((image) =>
    uploadToCloudinary(image, folder)
  );
  return Promise.all(uploadPromises);
}

/**
 * Delete image from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}

/**
 * Delete multiple images
 */
export async function deleteMultipleFromCloudinary(publicIds: string[]): Promise<void> {
  const deletePromises = publicIds.map((id) => deleteFromCloudinary(id));
  await Promise.all(deletePromises);
}

/**
 * Extract public_id from Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/v\d+\/(.+)\.\w+$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export default cloudinary;
