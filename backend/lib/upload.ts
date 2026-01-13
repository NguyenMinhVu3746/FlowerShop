import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

/**
 * Save base64 image to local filesystem
 * @param base64Image - Base64 encoded image string with data URI
 * @param folder - Subfolder within uploads directory
 * @returns Object with local file info
 */
export async function saveImageLocally(base64Image: string, folder: string = 'hoashop') {
  try {
    // Extract base64 data and mime type
    const matches = base64Image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 image format');
    }

    const imageType = matches[1]; // jpg, png, webp, etc
    const base64Data = matches[2];
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = randomBytes(8).toString('hex');
    const filename = `${timestamp}-${randomString}.${imageType}`;

    // Create upload directory path
    const uploadDir = join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, imageBuffer);

    // Return public URL path
    const publicUrl = `/uploads/${folder}/${filename}`;

    return {
      url: publicUrl,
      filename,
      folder,
      size: imageBuffer.length,
      format: imageType,
    };
  } catch (error) {
    console.error('Error saving image locally:', error);
    throw error;
  }
}

/**
 * Save multiple base64 images to local filesystem
 */
export async function saveMultipleImagesLocally(base64Images: string[], folder: string = 'hoashop') {
  const results = await Promise.all(
    base64Images.map((image) => saveImageLocally(image, folder))
  );
  return results;
}

/**
 * Delete image from local filesystem
 */
export async function deleteLocalImage(filePath: string) {
  try {
    const { unlink } = await import('fs/promises');
    const fullPath = join(process.cwd(), 'public', filePath);
    await unlink(fullPath);
    return true;
  } catch (error) {
    console.error('Error deleting local image:', error);
    return false;
  }
}
