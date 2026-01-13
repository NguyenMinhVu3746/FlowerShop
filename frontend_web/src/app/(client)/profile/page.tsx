'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, User as UserIcon, Mail, Phone, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { userApi } from '@/lib/api/user';
import { uploadApi } from '@/lib/api/upload';
import { useAuth } from '@/lib/hooks/use-auth';
import { getImageUrl } from '@/lib/utils/image';
import Image from 'next/image';

const profileSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await userApi.getProfile();
      // Backend returns { data: user } not { data: { user } }
      return response.data || null;
    },
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
    values: data
      ? {
          name: data.fullname || '',
          phone: data.phone || '',
        }
      : undefined,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!avatarFile) return null;
      const response = await uploadApi.upload([avatarFile]);
      console.log('Upload response:', response);
      // Backend returns nested structure
      const responseData = response.data as any;
      const imageUrl = responseData?.data?.images?.[0]?.url || responseData?.images?.[0]?.url || null;
      console.log('Extracted image URL:', imageUrl);
      return imageUrl;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: ProfileFormData) => {
      let avatarUrl = data?.avatar;
      
      // Upload avatar if changed
      if (avatarFile) {
        try {
          const uploadResult = await uploadMutation.mutateAsync();
          if (uploadResult) {
            avatarUrl = uploadResult;
          }
        } catch (uploadError) {
          console.error('Upload avatar error:', uploadError);
          throw new Error('Upload ảnh thất bại');
        }
      }

      console.log('Updating profile with data:', {
        fullname: formData.name,
        phone: formData.phone,
        avatar: avatarUrl,
      });

      const response = await userApi.updateProfile({
        fullname: formData.name,
        phone: formData.phone,
        avatar: avatarUrl || undefined,
      });
      
      console.log('Update profile response:', response);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      // Set cache trực tiếp với dữ liệu mới từ API
      queryClient.setQueryData(['profile'], updatedUser);
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success('Cập nhật thông tin thành công!');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Cập nhật thông tin thất bại'
      );
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ảnh phải nhỏ hơn 2MB');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-32 w-32 rounded-full mx-auto" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Không thể tải thông tin cá nhân</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['profile'] })}>
            Thử lại
          </Button>
        </div>
      </Card>
    );
  }

  const displayAvatar = avatarPreview || data.avatar;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {displayAvatar ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden">
                  <Image
                    src={getImageUrl(displayAvatar)}
                    alt={data.fullname || 'Avatar'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {(data.fullname || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {isEditing && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-5 w-5" />
                </label>
              )}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={!isEditing}
              />
            </div>
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                Click vào icon camera để thay đổi ảnh đại diện
              </p>
            )}
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <Input value={data.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Email không thể thay đổi
            </p>
          </div>

          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Họ và tên
                </FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Số điện thoại
                </FormLabel>
                <FormControl>
                  <Input {...field} disabled={!isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actions */}
          {isEditing && (
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setAvatarFile(null);
                  setAvatarPreview(null);
                  form.reset();
                }}
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                Hủy
              </Button>
            </div>
          )}
        </form>
      </Form>

      {/* Account Info */}
      <div className="mt-8 pt-8 border-t">
        <h2 className="font-semibold mb-4">Thông tin tài khoản</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Vai trò</p>
            <p className="font-medium">
              {data.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Ngày tham gia</p>
            <p className="font-medium">
              {new Date(data.createdAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
