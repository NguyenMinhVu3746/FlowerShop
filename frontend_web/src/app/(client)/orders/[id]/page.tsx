'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl, formatPrice } from '@/lib/utils';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  Calendar,
  FileText,
  CreditCard,
  Tag,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
    icon: Clock,
    color: 'bg-red-100 text-red-800',
  },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await userApi.getOrders();
      const order = response.data?.orders?.find((o: Order) => o.id === orderId);
      if (!order) throw new Error('Order not found');
      return order as Order;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-16 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto max-w-4xl py-16 px-4">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-muted-foreground mb-6">
            Đơn hàng không tồn tại hoặc bạn không có quyền xem
          </p>
          <Button asChild>
            <Link href="/profile/orders">Xem tất cả đơn hàng</Link>
          </Button>
        </div>
      </div>
    );
  }

  const order = data;
  const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig?.icon || Clock;

  // Calculate subtotal from items
  const subtotal = order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/profile/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách đơn hàng
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Đơn hàng #{order.id}</h1>
            <p className="text-muted-foreground">
              Đặt ngày{' '}
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
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Sản phẩm ({order.items.length})
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 last:pb-0 last:border-0 border-b"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    <Image
                      src={getImageUrl(item.variant.product.images?.[0])}
                      alt={item.variant.product.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.variant.product.slug}`}
                      className="font-medium hover:text-primary line-clamp-2"
                    >
                      {item.variant.product.title}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      Kích thước: {item.variant.size}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-muted-foreground">
                        x{item.quantity}
                      </p>
                      <p className="font-semibold">
                        {formatPrice(item.price)}đ
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Thông tin giao hàng
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{order.receiver.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.receiver.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <p className="text-sm">{order.receiver.address}</p>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Thời gian giao hàng</p>
                  <p className="text-sm text-muted-foreground">
                    {format(
                      new Date(order.receiver.deliveryDate),
                      'dd/MM/yyyy',
                      { locale: vi }
                    )}{' '}
                    - {order.receiver.deliverySlot}
                  </p>
                </div>
              </div>

              {order.messageCard && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Thiệp chúc mừng</p>
                    <p className="text-sm text-muted-foreground">
                      {order.messageCard}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Người gửi: {order.senderType === 'NAMED' ? 'Có ghi tên' : 'Ẩn danh'}
                    </p>
                  </div>
                </div>
              )}

              {order.note && (
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm font-medium mb-1">Ghi chú</p>
                  <p className="text-sm text-muted-foreground">{order.note}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Payment Info */}
          <div className="bg-card border rounded-lg p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Thanh toán
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{formatPrice(subtotal)}đ</span>
              </div>

              {/* Shipping and discount info not available in current schema */}

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Tổng cộng</span>
                <span className="text-primary">
                  {formatPrice(order.total)}đ
                </span>
              </div>

              <div className="pt-3 border-t">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {order.payment?.method === 'COD'
                      ? 'Thanh toán khi nhận hàng'
                      : order.payment?.method === 'BANK_TRANSFER'
                      ? 'Chuyển khoản ngân hàng'
                      : order.payment?.method === 'MOMO'
                      ? 'Ví MoMo'
                      : 'Ví VNPay'}
                  </span>
                </div>
                <Badge
                  variant={order.payment?.status === 'PAID' ? 'default' : 'secondary'}
                  className="w-full"
                >
                  {order.payment?.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold mb-3">Hành động</h3>
            <div className="space-y-2">
              {order.status === 'COMPLETED' && (
                <Button className="w-full" variant="outline" asChild>
                  <Link href={`/products/${order.items[0].variant.product.slug}`}>
                    Đánh giá sản phẩm
                  </Link>
                </Button>
              )}
              {order.status === 'PENDING' && (
                <Button className="w-full" variant="destructive">
                  Hủy đơn hàng
                </Button>
              )}
              <Button className="w-full" variant="outline" asChild>
                <Link href="/products">Mua lại</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
