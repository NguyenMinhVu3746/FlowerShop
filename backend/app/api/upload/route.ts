import { NextRequest } from 'next/server';
import { z } from 'zod';
import { errorResponse, successResponse } from '@/lib/response';
import { saveImageLocally, saveMultipleImagesLocally, deleteLocalImage } from '@/lib/upload';
import { authenticate } from '@/lib/auth';

// Validation schema
const uploadSchema = z.object({
  images: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất 1 ảnh').max(10, 'Tối đa 10 ảnh'),
  folder: z.string().optional().default('hoashop'),
});

const singleUploadSchema = z.object({
  image: z.string().min(1, 'Vui lòng chọn ảnh'),
  folder: z.string().optional().default('hoashop'),
});

/**
 * POST /api/upload
 * Upload single or multiple images to local filesystem
 * Body: { image: "base64...", folder?: "hoashop" }
 * OR
 * Body: { images: ["base64...", "base64..."], folder?: "hoashop" }
 */
export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError);
      return errorResponse('Dữ liệu JSON không hợp lệ. Vui lòng kiểm tra format base64 image.', 400);
    }

    // Check if single or multiple upload
    if (body.image) {
      // Single upload
      const { image, folder } = singleUploadSchema.parse(body);

      // Validate base64 format
      if (!image.startsWith('data:image/')) {
        return errorResponse('Định dạng ảnh không hợp lệ', 400);
      }

      const result = await saveImageLocally(image, folder);

      return successResponse({
        message: 'Upload ảnh thành công',
        data: {
          url: result.url,
          filename: result.filename,
          size: result.size,
          format: result.format,
        },
      });
    } else if (body.images) {
      // Multiple upload
      const { images, folder } = uploadSchema.parse(body);

      // Validate all images
      for (const image of images) {
        if (!image.startsWith('data:image/')) {
          return errorResponse('Một hoặc nhiều ảnh có định dạng không hợp lệ', 400);
        }
      }

      const results = await saveMultipleImagesLocally(images, folder);

      return successResponse({
        message: `Upload ${results.length} ảnh thành công`,
        data: {
          images: results.map((r) => ({
            url: r.url,
            filename: r.filename,
            size: r.size,
            format: r.format,
          })),
        },
      });
    } else {
      return errorResponse('Vui lòng cung cấp image hoặc images', 400);
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }
    console.error('Upload error:', error);
    return errorResponse('Upload thất bại. Vui lòng thử lại', 500);
  }
}

/**
 * DELETE /api/upload?filePath=/uploads/hoashop/xxx.jpg
 * Delete image from local filesystem
 */
export async function DELETE(req: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get('filePath');

    if (!filePath) {
      return errorResponse('Thiếu filePath', 400);
    }

    const deleted = await deleteLocalImage(filePath);

    if (!deleted) {
      return errorResponse('Xóa ảnh thất bại', 500);
    }

    return successResponse({
      message: 'Xóa ảnh thành công',
    });
  } catch (error: any) {
    console.error('Delete image error:', error);
    return errorResponse('Xóa ảnh thất bại', 500);
  }
}
