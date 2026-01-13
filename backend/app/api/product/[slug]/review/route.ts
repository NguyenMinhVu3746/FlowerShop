import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { reviewSchema } from '@/lib/validations/product';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const authResult = await authenticate(request);

    if (!authResult.authenticated) {
      return authResult.response;
    }

    const body = await request.json();
    const validatedData = reviewSchema.parse(body);

    // Check if product exists and get ID
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!product) {
      return errorResponse('Sản phẩm không tồn tại', 404);
    }

    // Check if user has ordered this product
    const hasOrdered = await prisma.orderItem.findFirst({
      where: {
        variant: {
          productId: product.id,
        },
        order: {
          userId: authResult.user!.userId,
          status: 'COMPLETED',
        },
      },
    });

    if (!hasOrdered) {
      return errorResponse(
        'Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua hàng',
        403
      );
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: authResult.user!.userId,
        productId: product.id,
      },
    });

    if (existingReview) {
      return errorResponse('Bạn đã đánh giá sản phẩm này rồi', 400);
    }

    const review = await prisma.review.create({
      data: {
        userId: authResult.user!.userId,
        productId: product.id,
        ...validatedData,
      },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            avatar: true,
          },
        },
      },
    });

    return successResponse(review, 'Đánh giá thành công', 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400);
    }
    return handleApiError(error);
  }
}
