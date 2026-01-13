'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Upload, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  useCategories,
  useUpsertProduct,
} from '@/lib/hooks/useAdminProducts';
import type { Product, VariantInput } from '@/types/admin';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export default function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const isEditMode = !!product;

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [variants, setVariants] = useState<VariantInput[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch data
  const { data: categories = [] } = useCategories();

  // Mutations
  const upsertMutation = useUpsertProduct();

  // Load product data when editing
  useEffect(() => {
    if (isEditMode && product && open) {
      setTitle(product.title || '');
      setDescription(product.description || '');
      setCategoryId(product.categoryId || '');
      setMetaTitle(product.metaTitle || '');
      setMetaDescription(product.metaDescription || '');
      setMetaKeywords(product.metaKeywords || '');
      setIsActive(product.isActive ?? true);

      // Load images
      const imageArray = Array.isArray(product.images) ? product.images : [];
      const validImages = imageArray.filter((img) => img && typeof img === 'string' && img.trim().length > 0);
      setImages(validImages);

      // Load variants
      const loadedVariants: VariantInput[] =
        product.variants?.map((v) => ({
          size: v.size,
          price: v.price,
          description: v.description || '',
          stock: v.stock,
          isActive: v.isActive,
        })) || [];
      setVariants(loadedVariants);
    } else if (!open) {
      // Reset form when dialog closes
      resetForm();
    }
  }, [isEditMode, product, open]);

  // Reset form
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategoryId('');
    setImages([]);
    setMetaTitle('');
    setMetaDescription('');
    setMetaKeywords('');
    setIsActive(true);
    setVariants([]);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (base64 && typeof base64 === 'string') {
        setImages([...images, base64]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // Filter out any null/undefined values that might have snuck in
    const validImages = newImages.filter((img) => img && typeof img === 'string');
    setImages(validImages);
  };

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

  // Add variant
  const addVariant = () => {
    setVariants([
      ...variants,
      { size: 'M', price: 0, description: '', stock: 0, isActive: true },
    ]);
  };

  // Remove variant
  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Update variant
  const updateVariant = (index: number, field: keyof VariantInput, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm');
      return;
    }
    if (!categoryId) {
      toast.error('Vui lòng chọn danh mục');
      return;
    }
    if (images.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 ảnh');
      return;
    }

    try {
      setIsUploading(true);

      // Filter valid images
      const validImages = images.filter(
        (img) => img && typeof img === 'string' && img.trim().length > 0
      );

      if (validImages.length === 0) {
        toast.error('Vui lòng thêm ít nhất 1 ảnh hợp lệ');
        setIsUploading(false);
        return;
      }

      // Prepare upsert data - GỬI TOÀN BỘ VÀO 1 REQUEST
      const upsertData: any = {
        title: title.trim(),
        categoryId,
        images: validImages, // Backend sẽ tự upload base64 images
        isActive,
        variants: variants.map((v) => ({
          size: v.size,
          price: Number(v.price),
          description: v.description?.trim() || undefined,
          stock: Number(v.stock),
          isActive: v.isActive,
        })),
      };

      // Add optional fields
      if (description?.trim()) upsertData.description = description.trim();
      if (metaTitle?.trim()) upsertData.metaTitle = metaTitle.trim();
      if (metaDescription?.trim()) upsertData.metaDescription = metaDescription.trim();
      if (metaKeywords?.trim()) upsertData.metaKeywords = metaKeywords.trim();

      // If edit mode, include product ID
      if (isEditMode && product) {
        upsertData.id = product.id;
      }

      // Call upsert API - TẤT CẢ TRONG 1 REQUEST DUY NHẤT
      await upsertMutation.mutateAsync(upsertData);

      toast.success(isEditMode ? 'Cập nhật sản phẩm thành công' : 'Tạo sản phẩm thành công');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving product:', error);
      // Toast error đã được handle trong mutation
    } finally {
      setIsUploading(false);
    }
  };

  const isSubmitting = upsertMutation.isPending || isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Cập nhật thông tin sản phẩm' : 'Tạo sản phẩm mới với biến thể và nguyên liệu'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Thông tin cơ bản</h3>

            <div className="space-y-2">
              <Label htmlFor="title">
                Tên sản phẩm <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bó hoa hồng đỏ tình yêu"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Danh mục <span className="text-red-500">*</span>
              </Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(categories) && categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết về sản phẩm..."
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="isActive">Kích hoạt sản phẩm</Label>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="font-semibold">
              Hình ảnh <span className="text-red-500">*</span>
            </h3>

            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Chọn ảnh
              </Button>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full aspect-square rounded-md overflow-hidden border">
                      <Image
                        src={getImageUrl(img)}
                        alt={`Product ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    {index === 0 && <Badge className="absolute bottom-1 left-1 text-xs">Ảnh chính</Badge>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Biến thể (Size)</h3>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm biến thể
              </Button>
            </div>

            {variants.length === 0 ? (
              <div className="border rounded-lg p-4 text-center text-muted-foreground">
                Chưa có biến thể nào. Nhấn &quot;Thêm biến thể&quot; để tạo mới.
              </div>
            ) : (
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Biến thể #{index + 1}</h4>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Size</Label>
                        <Select
                          value={variant.size}
                          onValueChange={(value) => updateVariant(index, 'size', value as 'S' | 'M' | 'L')}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="S">S - Nhỏ</SelectItem>
                            <SelectItem value="M">M - Vừa</SelectItem>
                            <SelectItem value="L">L - Lớn</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Giá (VNĐ)</Label>
                        <Input
                          type="number"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', Number(e.target.value))}
                          placeholder="200000"
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tồn kho</Label>
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, 'stock', Number(e.target.value))}
                          placeholder="100"
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Mô tả size</Label>
                        <Input
                          value={variant.description || ''}
                          onChange={(e) => updateVariant(index, 'description', e.target.value)}
                          placeholder="50 bông hoa"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={variant.isActive}
                        onCheckedChange={(checked) => updateVariant(index, 'isActive', checked)}
                      />
                      <Label>Kích hoạt biến thể này</Label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang upload...
                </>
              ) : isSubmitting ? (
                'Đang xử lý...'
              ) : isEditMode ? (
                'Cập nhật'
              ) : (
                'Tạo sản phẩm'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
