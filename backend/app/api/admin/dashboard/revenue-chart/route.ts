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
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily revenue data
    const orders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const revenueByDate: { [key: string]: number } = {};
    
    orders.forEach((order: any) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!revenueByDate[date]) {
        revenueByDate[date] = 0;
      }
      revenueByDate[date] += Number(order.total);
    });

    // Convert to array format for charts
    const chartData = Object.keys(revenueByDate)
      .sort()
      .map((date) => ({
        date,
        revenue: revenueByDate[date],
      }));

    // Calculate statistics
    const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
    const averageRevenue = chartData.length > 0 ? totalRevenue / chartData.length : 0;

    return successResponse({
      chartData,
      statistics: {
        totalRevenue,
        averageRevenue: Math.round(averageRevenue),
        totalOrders: orders.length,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
