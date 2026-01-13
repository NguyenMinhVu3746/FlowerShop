/**
 * ADMIN DASHBOARD PAGE
 * ====================
 * Overview with stats, revenue chart, top products
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Star,
} from 'lucide-react';

export default function AdminDashboardPage() {
  // Fetch overview stats
  const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/admin/dashboard/overview');
        console.log('Dashboard Overview Response:', response.data);
        return response.data.data || response.data;
      } catch (error: any) {
        console.error('Dashboard Overview Error:', error.response?.data || error.message);
        toast.error(`Lỗi tải thống kê: ${error.response?.data?.message || error.message}`);
        throw error;
      }
    },
  });

  // Fetch revenue chart data
  const { data: revenueData, isLoading: revenueLoading, error: revenueError } = useQuery({
    queryKey: ['admin-revenue-chart'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/admin/dashboard/revenue-chart');
        console.log('Revenue Chart Response:', response.data);
        return response.data.data || response.data;
      } catch (error: any) {
        console.error('Revenue Chart Error:', error.response?.data || error.message);
        toast.error(`Lỗi tải biểu đồ doanh thu: ${error.response?.data?.message || error.message}`);
        throw error;
      }
    },
  });

  // Fetch top products
  const { data: topProductsData, isLoading: topProductsLoading, error: topProductsError } = useQuery({
    queryKey: ['admin-top-products'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/admin/dashboard/top-products');
        console.log('Top Products Response:', response.data);
        return response.data.data || response.data;
      } catch (error: any) {
        console.error('Top Products Error:', error.response?.data || error.message);
        toast.error(`Lỗi tải sản phẩm bán chạy: ${error.response?.data?.message || error.message}`);
        throw error;
      }
    },
  });

  const stats = [
    {
      title: 'Tổng sản phẩm',
      value: overviewData?.statistics?.totalProducts || 0,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Đơn hàng',
      value: overviewData?.statistics?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Doanh thu',
      value: `${(overviewData?.statistics?.totalRevenue || 0).toLocaleString('vi-VN')}đ`,
      icon: DollarSign,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: 'Đánh giá',
      value: overviewData?.statistics?.totalUsers || 0,
      icon: Star,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewLoading
          ? [...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          : stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`rounded-full p-3 ${stat.bg}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Doanh thu 7 ngày qua
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !revenueData?.chartData || revenueData.chartData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Chưa có dữ liệu doanh thu
            </div>
          ) : (
            <div className="space-y-4">
              {revenueData.chartData.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-600">
                    {new Date(item.date).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex-1">
                    <div className="h-8 rounded bg-primary/10">
                      <div
                        className="h-full rounded bg-primary transition-all"
                        style={{
                          width: `${
                            (item.revenue / Math.max(...revenueData.chartData.map((d: any) => d.revenue))) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-32 text-right font-semibold">
                    {item.revenue.toLocaleString('vi-VN')}đ
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Top 10 sản phẩm bán chạy
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topProductsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !topProductsData?.topProducts || topProductsData.topProducts.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Chưa có dữ liệu sản phẩm
            </div>
          ) : (
            <div className="space-y-4">
              {topProductsData.topProducts.map((product: any, index: number) => (
                <div
                  key={product.productId}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-600">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{product.title}</p>
                    <p className="text-sm text-gray-600">
                      Đã bán: {product.totalQuantity} | Đơn hàng: {product.orderCount}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {product.totalRevenue.toLocaleString('vi-VN')}đ
                    </p>
                    <p className="text-sm text-gray-600">Doanh thu</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
