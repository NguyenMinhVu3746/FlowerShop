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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get order items with product info
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          status: 'COMPLETED',
          createdAt: {
            gte: startDate,
          },
        },
      },
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
    });

    // Aggregate by product
    const productStats: {
      [key: string]: {
        product: any;
        totalQuantity: number;
        totalRevenue: number;
        orderCount: number;
      };
    } = {};

    orderItems.forEach((item: any) => {
      const productId = item.variant.product.id;

      if (!productStats[productId]) {
        productStats[productId] = {
          product: item.variant.product,
          totalQuantity: 0,
          totalRevenue: 0,
          orderCount: 0,
        };
      }

      productStats[productId].totalQuantity += item.quantity;
      productStats[productId].totalRevenue += Number(item.price) * item.quantity;
      productStats[productId].orderCount += 1;
    });

    // Convert to array and sort by quantity
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit)
      .map((stat) => ({
        productId: stat.product.id,
        title: stat.product.title,
        slug: stat.product.slug,
        image: Array.isArray(stat.product.images) 
          ? stat.product.images[0] 
          : null,
        totalQuantity: stat.totalQuantity,
        totalRevenue: stat.totalRevenue,
        orderCount: stat.orderCount,
      }));

    return successResponse({
      topProducts,
      dateRange: {
        days,
        start: startDate.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
