import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    // Get statistics
    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      pendingOrders,
      completedOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        where: {
          status: { in: ['COMPLETED'] },
        },
        _sum: {
          total: true,
        },
      }),
      prisma.product.count(),
      prisma.user.count({
        where: { role: 'USER' },
      }),
      prisma.order.count({
        where: { status: 'PENDING' },
      }),
      prisma.order.count({
        where: { status: 'COMPLETED' },
      }),
    ]);

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            fullname: true,
            email: true,
          },
        },
        receiver: true,
      },
    });

    return successResponse({
      statistics: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalProducts,
        totalUsers,
        pendingOrders,
        completedOrders,
      },
      recentOrders,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
