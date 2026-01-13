'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  Printer,
  MoreVertical,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Order {
  id: string;
  userId: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';
  total: number;
  note: string | null;
  messageCard: string | null;
  senderType: 'NAMED' | 'ANONYMOUS';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    fullname: string;
    phone: string | null;
  };
  receiver?: {
    name: string;
    phone: string;
    address: string;
    deliveryDate: string;
    deliverySlot: string;
  };
  items?: Array<{
    id: string;
    quantity: number;
    price: number;
    variant: {
      size: string;
      product: {
        title: string;
        images: string[];
      };
    };
  }>;
  payment?: {
    method: string;
    status: string;
    amount: number;
  };
}

const ORDER_STATUSES = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
  PREPARING: { label: 'Đang chuẩn bị', color: 'bg-purple-100 text-purple-800', icon: Package },
  DELIVERING: { label: 'Đang giao', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders', page, statusFilter],
    queryFn: async () => {
      const params: any = { page, limit: 20 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await apiClient.get('/admin/orders', { params });
      return response.data;
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiClient.patch(`/admin/order/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Cập nhật trạng thái thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    },
  });

  // Print order
  const handlePrint = async (orderId: string) => {
    try {
      const response = await apiClient.get(`/admin/order/${orderId}/print`);
      // Open print dialog with order data
      console.log('Print data:', response.data);
      toast.success('Đang chuẩn bị in...');
      // TODO: Implement actual print functionality
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi in đơn hàng');
    }
  };

  const orders = ordersData?.data?.orders || [];
  const pagination = ordersData?.data?.pagination;

  // Filter orders by search
  const filteredOrders = orders.filter(
    (order: Order) =>
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      order.receiver?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const stats = {
    pending: orders.filter((o: Order) => o.status === 'PENDING').length,
    confirmed: orders.filter((o: Order) => o.status === 'CONFIRMED').length,
    preparing: orders.filter((o: Order) => o.status === 'PREPARING').length,
    delivering: orders.filter((o: Order) => o.status === 'DELIVERING').length,
    completed: orders.filter((o: Order) => o.status === 'COMPLETED').length,
    cancelled: orders.filter((o: Order) => o.status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Quản Lý Đơn Hàng</h1>
        <p className="text-muted-foreground">Theo dõi và xử lý đơn hàng</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ xác nhận</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã xác nhận</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang chuẩn bị</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.preparing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang giao</CardTitle>
            <Truck className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivering}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã hủy</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm đơn hàng..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {Object.entries(ORDER_STATUSES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã ĐH</TableHead>
                <TableHead>Khách Hàng</TableHead>
                <TableHead>Người Nhận</TableHead>
                <TableHead>Tổng Tiền</TableHead>
                <TableHead>Thanh Toán</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Ngày Đặt</TableHead>
                <TableHead className="text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Không tìm thấy đơn hàng
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order: Order) => {
                  const StatusIcon = ORDER_STATUSES[order.status].icon;
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        #{order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.user?.fullname}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.user?.phone || order.user?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.receiver?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.receiver?.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {order.total.toLocaleString('vi-VN')}đ
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.payment?.method || 'COD'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={ORDER_STATUSES[order.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {ORDER_STATUSES[order.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedOrder(order);
                                setDetailDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrint(order.id)}>
                              <Printer className="h-4 w-4 mr-2" />
                              In đơn hàng
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Cập nhật trạng thái</DropdownMenuLabel>
                            {order.status === 'PENDING' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: order.id,
                                    status: 'CONFIRMED',
                                  })
                                }
                              >
                                Xác nhận
                              </DropdownMenuItem>
                            )}
                            {order.status === 'CONFIRMED' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: order.id,
                                    status: 'PREPARING',
                                  })
                                }
                              >
                                Đang chuẩn bị
                              </DropdownMenuItem>
                            )}
                            {order.status === 'PREPARING' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: order.id,
                                    status: 'DELIVERING',
                                  })
                                }
                              >
                                Đang giao hàng
                              </DropdownMenuItem>
                            )}
                            {order.status === 'DELIVERING' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: order.id,
                                    status: 'COMPLETED',
                                  })
                                }
                              >
                                Hoàn thành
                              </DropdownMenuItem>
                            )}
                            {!['COMPLETED', 'CANCELLED'].includes(order.status) && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: order.id,
                                    status: 'CANCELLED',
                                  })
                                }
                              >
                                Hủy đơn
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(page - 1) * 20 + 1} - {Math.min(page * 20, pagination.total)} của{' '}
                {pagination.total} đơn hàng
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
            <DialogDescription>
              Ngày đặt:{' '}
              {selectedOrder &&
                format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Họ tên:</span>{' '}
                    {selectedOrder.user?.fullname}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{' '}
                    {selectedOrder.user?.email}
                  </div>
                  <div>
                    <span className="text-muted-foreground">SĐT:</span> {selectedOrder.user?.phone}
                  </div>
                </div>
              </div>

              {/* Receiver Info */}
              <div>
                <h3 className="font-semibold mb-2">Thông tin người nhận</h3>
                <div className="grid gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Họ tên:</span>{' '}
                    {selectedOrder.receiver?.name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">SĐT:</span>{' '}
                    {selectedOrder.receiver?.phone}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Địa chỉ:</span>{' '}
                    {selectedOrder.receiver?.address}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Giao hàng:</span>{' '}
                    {selectedOrder.receiver?.deliveryDate} - {selectedOrder.receiver?.deliverySlot}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Sản phẩm</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        {item.variant.product.title} - Size {item.variant.size} x {item.quantity}
                      </div>
                      <div className="font-medium">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <div>Tổng cộng:</div>
                  <div className="text-lg">{selectedOrder.total.toLocaleString('vi-VN')}đ</div>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <div className="text-muted-foreground">Phương thức:</div>
                  <div>{selectedOrder.payment?.method || 'COD'}</div>
                </div>
              </div>

              {/* Notes */}
              {(selectedOrder.note || selectedOrder.messageCard) && (
                <div className="space-y-2">
                  {selectedOrder.note && (
                    <div>
                      <div className="text-sm font-medium">Ghi chú:</div>
                      <div className="text-sm text-muted-foreground">{selectedOrder.note}</div>
                    </div>
                  )}
                  {selectedOrder.messageCard && (
                    <div>
                      <div className="text-sm font-medium">Lời nhắn thiệp:</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedOrder.messageCard}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
