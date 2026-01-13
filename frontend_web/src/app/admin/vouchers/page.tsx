'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, MoreVertical, Percent, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Voucher {
  id: string;
  code: string;
  description: string | null;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrder: number | null;
  maxDiscount: number | null;
  startDate: string;
  endDate: string;
  quantity: number;
  used: number;
  isActive: boolean;
  createdAt: string;
}

export default function VouchersPage() {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<Voucher | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    value: 0,
    minOrder: 0,
    maxDiscount: 0,
    startDate: '',
    endDate: '',
    quantity: 100,
    isActive: true,
  });

  // Fetch vouchers
  const { data: vouchersData, isLoading, error: vouchersError } = useQuery({
    queryKey: ['admin-vouchers'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/admin/voucher');
        console.log('Vouchers Response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Vouchers Error:', error.response?.data || error.message);
        toast.error(`Lỗi tải voucher: ${error.response?.data?.message || error.message}`);
        throw error;
      }
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiClient.post('/admin/voucher', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      toast.success('Tạo voucher thành công');
      setFormDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Tạo voucher thất bại');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiClient.patch(`/admin/voucher/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      toast.success('Cập nhật voucher thành công');
      setFormDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/voucher/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] });
      toast.success('Xóa voucher thành công');
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xóa voucher thất bại');
    },
  });

  const vouchers = vouchersData?.data?.vouchers || [];

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      type: 'PERCENTAGE',
      value: 0,
      minOrder: 0,
      maxDiscount: 0,
      startDate: '',
      endDate: '',
      quantity: 100,
      isActive: true,
    });
    setEditingVoucher(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure numeric fields are numbers
    const submitData = {
      ...formData,
      value: Number(formData.value),
      minOrder: Number(formData.minOrder) || 0,
      maxDiscount: Number(formData.maxDiscount) || 0,
      quantity: Number(formData.quantity),
    };
    
    if (editingVoucher) {
      updateMutation.mutate({ id: editingVoucher.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const openEditDialog = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code,
      description: voucher.description || '',
      type: voucher.type,
      value: voucher.value,
      minOrder: voucher.minOrder || 0,
      maxDiscount: voucher.maxDiscount || 0,
      startDate: voucher.startDate.split('T')[0],
      endDate: voucher.endDate.split('T')[0],
      quantity: voucher.quantity,
      isActive: voucher.isActive,
    });
    setFormDialogOpen(true);
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Voucher</h1>
          <p className="text-muted-foreground">Quản lý mã giảm giá</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setFormDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm Voucher
        </Button>
      </div>

      {/* Vouchers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã Voucher</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Giá Trị</TableHead>
                <TableHead>Đơn Tối Thiểu</TableHead>
                <TableHead>Số Lượng</TableHead>
                <TableHead>Đã Dùng</TableHead>
                <TableHead>Thời Hạn</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead className="text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : vouchers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Chưa có voucher nào
                  </TableCell>
                </TableRow>
              ) : (
                vouchers.map((voucher: Voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell>
                      <div>
                        <div className="font-mono font-bold">{voucher.code}</div>
                        <div className="text-sm text-muted-foreground">
                          {voucher.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {voucher.type === 'PERCENTAGE' ? (
                          <>
                            <Percent className="h-3 w-3" />
                            Phần trăm
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-3 w-3" />
                            Cố định
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {voucher.type === 'PERCENTAGE'
                        ? `${voucher.value}%`
                        : `${voucher.value.toLocaleString('vi-VN')}đ`}
                    </TableCell>
                    <TableCell>
                      {voucher.minOrder ? `${voucher.minOrder.toLocaleString('vi-VN')}đ` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{voucher.quantity}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={voucher.used >= voucher.quantity ? 'destructive' : 'default'}
                      >
                        {voucher.used}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(voucher.startDate), 'dd/MM/yyyy', { locale: vi })}</div>
                        <div className="text-muted-foreground">
                          {format(new Date(voucher.endDate), 'dd/MM/yyyy', { locale: vi })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isExpired(voucher.endDate) ? (
                        <Badge variant="secondary">Hết hạn</Badge>
                      ) : voucher.used >= voucher.quantity ? (
                        <Badge variant="secondary">Hết lượt</Badge>
                      ) : voucher.isActive ? (
                        <Badge variant="default">Hoạt động</Badge>
                      ) : (
                        <Badge variant="secondary">Tạm ngưng</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(voucher)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setVoucherToDelete(voucher);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa voucher &quot;{voucherToDelete?.code}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => voucherToDelete && deleteMutation.mutate(voucherToDelete.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingVoucher ? 'Sửa Voucher' : 'Thêm Voucher'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Mã voucher *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="SUMMER2024"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Loại giảm giá *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                    <SelectItem value="FIXED">Cố định (VNĐ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value">
                  Giá trị * {formData.type === 'PERCENTAGE' ? '(%)' : '(VNĐ)'}
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="quantity">Số lượng *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minOrder">Đơn tối thiểu (VNĐ)</Label>
                <Input
                  id="minOrder"
                  type="number"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="maxDiscount">Giảm tối đa (VNĐ)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDiscount: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">Ngày kết thúc *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Hoạt động</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormDialogOpen(false)}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Đang lưu...'
                  : editingVoucher
                  ? 'Cập nhật'
                  : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
