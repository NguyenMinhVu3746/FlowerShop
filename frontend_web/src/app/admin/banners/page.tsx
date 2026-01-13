'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Image as ImageIcon, Link as LinkIcon, MoreVertical, Upload, X } from 'lucide-react';
import Image from 'next/image';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Banner {
  id: number;
  title: string;
  image: string;
  link: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface BannerFormData {
  title: string;
  image: string;
  link: string;
  order: number;
}

export default function AdminBannersPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    image: '',
    link: '',
    order: 0,
  });

  // Get image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    // Fix paths without leading slash (from old seed data)
    let normalizedPath = imagePath;
    if (imagePath.startsWith('uploads/')) {
      normalizedPath = '/' + imagePath;
    }
    if (normalizedPath.startsWith('/')) return `${API_URL}${normalizedPath}`;
    return `${API_URL}/${normalizedPath}`;
  };

  // Fetch banners
  const { data: bannersResponse, isLoading, error: bannersError } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/admin/banner');
        console.log('Banners Response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Banners Error:', error.response?.data || error.message);
        toast.error(`Lỗi tải banner: ${error.response?.data?.message || error.message}`);
        throw error;
      }
    },
  });

  const banners = Array.isArray(bannersResponse) ? bannersResponse : (bannersResponse?.data || []);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: BannerFormData) => {
      const response = await apiClient.post('/admin/banner', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Thêm banner thành công');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Thêm banner thất bại');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BannerFormData }) => {
      const response = await apiClient.patch(`/admin/banner/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Cập nhật banner thành công');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Cập nhật banner thất bại');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/admin/banner/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Xóa banner thành công');
      setDeleteDialogOpen(false);
      setBannerToDelete(null);
    },
    onError: () => {
      toast.error('Xóa banner thất bại');
    },
  });

  const handleOpenDialog = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title,
        image: banner.image,
        link: banner.link || '',
        order: banner.order,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        image: '',
        link: '',
        order: banners.length + 1,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBanner(null);
    setFormData({
      title: '',
      image: '',
      link: '',
      order: 0,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh phải nhỏ hơn 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('images', file);

      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = response.data?.data?.images?.[0]?.url || response.data?.images?.[0]?.url;
      if (imageUrl) {
        setFormData(prev => ({ ...prev, image: imageUrl }));
        toast.success('Tải ảnh thành công');
      } else {
        throw new Error('Không nhận được URL ảnh');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Tải ảnh thất bại');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBanner) {
      updateMutation.mutate({ id: editingBanner.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteClick = (banner: Banner) => {
    setBannerToDelete(banner);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (bannerToDelete) {
      deleteMutation.mutate(bannerToDelete.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Banner</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý banner hiển thị trên trang chủ
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm banner
        </Button>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tổng số banner</CardTitle>
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{banners.length}</div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="text-sm text-muted-foreground">Đang tải...</p>
              </div>
            </div>
          ) : banners.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-muted-foreground">Chưa có banner nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Thứ tự</TableHead>
                  <TableHead className="w-[120px]">Hình ảnh</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Liên kết</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-[80px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners
                  .sort((a: Banner, b: Banner) => a.order - b.order)
                  .map((banner: Banner) => (
                    <TableRow key={banner.id}>
                      <TableCell className="font-medium">#{banner.order}</TableCell>
                      <TableCell>
                        <div className="relative h-16 w-24 overflow-hidden rounded border">
                          <Image
                            src={getImageUrl(banner.image)}
                            alt={banner.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{banner.title}</div>
                      </TableCell>
                      <TableCell>
                        {banner.link ? (
                          <a
                            href={banner.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <LinkIcon className="h-3 w-3" />
                            {banner.link}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(banner.createdAt).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(banner)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(banner)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? 'Sửa banner' : 'Thêm banner mới'}
            </DialogTitle>
            <DialogDescription>
              {editingBanner
                ? 'Cập nhật thông tin banner'
                : 'Nhập thông tin banner mới'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Tiêu đề <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="VD: Khuyến mãi mùa hè"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">
                  Hình ảnh <span className="text-destructive">*</span>
                </Label>
                
                {formData.image ? (
                  <div className="space-y-2">
                    <div className="relative h-48 w-full overflow-hidden rounded border">
                      <Image
                        src={getImageUrl(formData.image)}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-48"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
                          <span>Đang tải...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8" />
                          <span>Click để chọn ảnh</span>
                          <span className="text-xs text-muted-foreground">
                            JPG, PNG (tối đa 5MB)
                          </span>
                        </div>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Liên kết</Label>
                <Input
                  id="link"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  placeholder="/products/hoa-rose"
                />
                <p className="text-xs text-muted-foreground">
                  Đường dẫn khi click vào banner (để trống nếu không cần)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">
                  Thứ tự hiển thị <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Banner với số thứ tự nhỏ hơn sẽ hiển thị trước
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending || !formData.image}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Đang xử lý...'
                  : editingBanner
                    ? 'Cập nhật'
                    : 'Thêm mới'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa banner &quot;{bannerToDelete?.title}&quot; không?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
