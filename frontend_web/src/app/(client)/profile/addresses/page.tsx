'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Plus,
  MapPin,
  Phone,
  User,
  Trash2,
  Pencil,
  Loader2,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { userApi } from '@/lib/api/user';
import type { Address } from '@/types';

const addressSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề'),
  nameReceiver: z.string().min(2, 'Tên người nhận phải có ít nhất 2 ký tự'),
  phoneReceiver: z
    .string()
    .regex(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số'),
  province: z.string().min(1, 'Vui lòng nhập tỉnh/thành phố'),
  district: z.string().min(1, 'Vui lòng nhập quận/huyện'),
  ward: z.string().min(1, 'Vui lòng nhập phường/xã'),
  fullAddress: z.string().min(10, 'Vui lòng nhập địa chỉ chi tiết'),
  isDefault: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await userApi.getAddresses();
      return response.data.addresses as Address[];
    },
  });

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      title: '',
      nameReceiver: '',
      phoneReceiver: '',
      province: '',
      district: '',
      ward: '',
      fullAddress: '',
      isDefault: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      return await userApi.addAddress(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setIsDialogOpen(false);
      form.reset();
      toast.success('Thêm địa chỉ thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Thêm địa chỉ thất bại');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: AddressFormData;
    }) => {
      return await userApi.updateAddress(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setIsDialogOpen(false);
      setEditingAddress(null);
      form.reset();
      toast.success('Cập nhật địa chỉ thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cập nhật địa chỉ thất bại');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await userApi.deleteAddress(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setDeletingId(null);
      toast.success('Xóa địa chỉ thành công!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xóa địa chỉ thất bại');
      setDeletingId(null);
    },
  });

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      form.reset({
        title: address.title,
        nameReceiver: address.nameReceiver,
        phoneReceiver: address.phoneReceiver,
        province: address.province,
        district: address.district,
        ward: address.ward,
        fullAddress: address.fullAddress,
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      form.reset();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAddress(null);
    form.reset();
  };

  const onSubmit = (data: AddressFormData) => {
    if (editingAddress) {
      updateMutation.mutate({ id: editingAddress.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sổ địa chỉ</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm địa chỉ mới
        </Button>
      </div>

      {/* Addresses Grid */}
      {data && data.length > 0 ? (
        <div className="grid gap-4">
          {data.map((address) => (
            <Card key={address.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{address.title}</h3>
                  {address.isDefault && (
                    <Badge className="bg-green-100 text-green-800">
                      <Star className="mr-1 h-3 w-3 fill-current" />
                      Mặc định
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(address)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId === address.id}
                  >
                    {deletingId === address.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-destructive" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{address.nameReceiver}</p>
                    <p className="text-muted-foreground">Người nhận</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{address.phoneReceiver}</p>
                    <p className="text-muted-foreground">Số điện thoại</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{address.fullAddress}</p>
                    <p className="text-muted-foreground">
                      {address.ward}, {address.district}, {address.province}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Chưa có địa chỉ nào</h3>
          <p className="text-muted-foreground mb-6">
            Thêm địa chỉ để tiện cho việc đặt hàng
          </p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm địa chỉ mới
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? 'Cập nhật thông tin địa chỉ giao hàng'
                : 'Điền thông tin địa chỉ giao hàng mới'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Nhà riêng, Công ty, ..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Receiver Info */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nameReceiver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên người nhận</FormLabel>
                      <FormControl>
                        <Input placeholder="Nguyễn Văn A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneReceiver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="0987654321"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tỉnh/Thành phố</FormLabel>
                      <FormControl>
                        <Input placeholder="TP. Hồ Chí Minh" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quận/Huyện</FormLabel>
                      <FormControl>
                        <Input placeholder="Quận 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phường/Xã</FormLabel>
                      <FormControl>
                        <Input placeholder="Phường Bến Nghé" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Full Address */}
              <FormField
                control={form.control}
                name="fullAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ chi tiết</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Số nhà, tên đường, ..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Default Checkbox */}
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">
                      Đặt làm địa chỉ mặc định
                    </FormLabel>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingAddress ? 'Đang cập nhật...' : 'Đang lưu...'}
                    </>
                  ) : editingAddress ? (
                    'Cập nhật'
                  ) : (
                    'Lưu địa chỉ'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
