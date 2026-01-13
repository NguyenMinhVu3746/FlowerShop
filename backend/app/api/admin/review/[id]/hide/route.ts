import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';
import { z } from 'zod';

const hideReviewSchema = z.object({
  isHidden: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await request.json();
    const { isHidden } = hideReviewSchema.parse(body);

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    });

    if (!review) {
      return errorResponse('Đánh giá không tồn tại', 404);
    }

    const updatedReview = await prisma.review.update({
      where: { id: params.id },
      data: { isHidden },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return successResponse(
      updatedReview,
      isHidden ? 'Đã ẩn đánh giá' : 'Đã hiện đánh giá'
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400);
    }
    return handleApiError(error);
  }
}
