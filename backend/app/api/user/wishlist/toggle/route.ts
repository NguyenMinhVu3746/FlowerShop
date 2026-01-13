import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';
import { z } from 'zod';

const toggleWishlistSchema = z.object({
  productId: z.string().min(1, 'ID sản phẩm không được để trống'),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticate(request);

    if (!authResult.authenticated) {
      return authResult.response;
    }

    const body = await request.json();
    const { productId } = toggleWishlistSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: authResult.user!.userId },
    });

    if (!user) {
      return errorResponse('Vui lòng đăng nhập lại', 401);
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return errorResponse('Sản phẩm không tồn tại', 404);
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: authResult.user!.userId,
          productId,
        },
      },
    });

    if (existing) {
      // Remove from wishlist
      await prisma.wishlist.delete({
        where: {
          userId_productId: {
            userId: authResult.user!.userId,
            productId,
          },
        },
      });

      return successResponse(
        { inWishlist: false },
        'Đã xóa khỏi danh sách yêu thích'
      );
    } else {
      // Add to wishlist
      await prisma.wishlist.create({
        data: {
          userId: authResult.user!.userId,
          productId,
        },
      });

      return successResponse(
        { inWishlist: true },
        'Đã thêm vào danh sách yêu thích'
      );
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.issues[0].message, 400);
    }
    return handleApiError(error);
  }
}
