import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { adminReplySchema } from '@/lib/validations/product';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await request.json();
    const validatedData = adminReplySchema.parse(body);

    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        adminReply: true,
      },
    });

    if (!review) {
      return errorResponse('Đánh giá không tồn tại', 404);
    }

    if (review.adminReply) {
      return errorResponse('Đánh giá này đã được trả lời', 400);
    }

    const reply = await prisma.adminReply.create({
      data: {
        reviewId: params.id,
        content: validatedData.content,
      },
      include: {
        review: {
          include: {
            user: {
              select: {
                id: true,
                fullname: true,
                email: true,
              },
            },
            product: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return successResponse(reply, 'Trả lời đánh giá thành công', 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(error.errors[0].message, 400);
    }
    return handleApiError(error);
  }
}
