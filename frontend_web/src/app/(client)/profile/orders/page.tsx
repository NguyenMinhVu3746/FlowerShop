'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  Search,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getImageUrl, formatPrice } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { userApi } from '@/lib/api/user';
import type { Order, OrderStatus } from '@/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; icon: any; color: string }
> = {
  PENDING: {
    label: 'Chờ xác nhận',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    icon: CheckCircle2,
    color: 'bg-blue-100 text-blue-800',
  },
  PREPARING: {
    label: 'Đang chuẩn bị',
    icon: Package,
    color: 'bg-purple-100 text-purple-800',
  },
  SHIPPING: {
    label: 'Đang giao hàng',
    icon: Truck,
    color: 'bg-indigo-100 text-indigo-800',
  },
  DELIVERED: {
    label: 'Đã giao hàng',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800',
  },
  CANCELLED: {
    label: 'Đã hủy',
    icon: XCircle,
    color: 'bg-red-100 text-red-800',
  },
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await userApi.getOrders();
      return response.data?.orders as Order[];
    },
  });

  // Filter orders
  const filteredOrders = data?.filter((order) => {
    const matchSearch =
      searchQuery === '' ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.variant.product.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );

    const matchStatus = statusFilter === 'ALL' || order.status === statusFilter;

    return matchSearch && matchStatus;
  });

  // Count by status
  const statusCounts = data?.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    {} as Record<OrderStatus, number>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm đơn hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={(value) => setStatusFilter(value as OrderStatus | 'ALL')}
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="ALL" className="flex-shrink-0">
            Tất cả ({data?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="PENDING" className="flex-shrink-0">
            Chờ xác nhận ({statusCounts?.PENDING || 0})
          </TabsTrigger>
          <TabsTrigger value="SHIPPING" className="flex-shrink-0">
            Đang giao ({statusCounts?.SHIPPING || 0})
          </TabsTrigger>
          <TabsTrigger value="DELIVERED" className="flex-shrink-0">
            Đã giao ({statusCounts?.DELIVERED || 0})
          </TabsTrigger>
          <TabsTrigger value="CANCELLED" className="flex-shrink-0">
            Đã hủy ({statusCounts?.CANCELLED || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          {filteredOrders && filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.PENDING;
                const StatusIcon = statusConfig?.icon || Clock;

                return (
                  <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b">
                      <div>
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-semibold hover:text-primary"
                        >
                          Đơn hàng #{order.id}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(order.createdAt), 'dd/MM/yyyy - HH:mm', {
                            locale: vi,
                          })}
                        </p>
                      </div>
                      <Badge className={statusConfig.color}>
                        <StatusIcon className="mr-2 h-4 w-4" />
                        {statusConfig.label}
                      </Badge>
                    </div>

                    {/* Items */}
                    <div className="py-4 space-y-3">
                      {order.items.slice(0, 2).map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                            <Image
                              src={getImageUrl(item.variant.product.images?.[0])}
                              alt={item.variant.product.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium line-clamp-1">
                              {item.variant.product.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.variant.size} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-semibold flex-shrink-0">
                            {formatPrice(item.price)}đ
                          </p>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-sm text-muted-foreground">
                          Và {order.items.length - 2} sản phẩm khác...
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Tổng cộng</p>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(order.total)}đ
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {order.status === 'DELIVERED' && (
                          <Button variant="outline" size="sm">
                            Đánh giá
                          </Button>
                        )}
                        {order.status === 'PENDING' && (
                          <Button variant="destructive" size="sm">
                            Hủy đơn
                          </Button>
                        )}
                        <Button asChild size="sm">
                          <Link href={`/orders/${order.id}`}>
                            Xem chi tiết
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Không có đơn hàng nào
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? 'Không tìm thấy đơn hàng phù hợp'
                  : statusFilter === 'ALL'
                  ? 'Bạn chưa có đơn hàng nào'
                  : `Không có đơn hàng ${ORDER_STATUS_CONFIG[statusFilter as OrderStatus]?.label.toLowerCase()}`}
              </p>
              <Button asChild>
                <Link href="/products">Khám phá sản phẩm</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
