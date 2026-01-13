'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, MoreVertical, Package } from 'lucide-react';
import Image from 'next/image';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useProducts,
  useDeleteProduct,
  useUpdateProduct,
  useCategories,
} from '@/lib/hooks/useAdminProducts';
import type { Product } from '@/types/admin';
import ProductFormDialog from './ProductFormDialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Fetch data
  const { data: productsData, isLoading } = useProducts(page, 20);
  const { data: categories = [] } = useCategories();
  const deleteMutation = useDeleteProduct();
  
  const products = productsData?.products || [];
  const pagination = productsData?.pagination;

  // Filter products
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get stats
  const activeCount = products.filter((p: Product) => p.isActive).length;
  const inactiveCount = products.filter((p: Product) => !p.isActive).length;
  const totalVariants = products.reduce((sum: number, p: Product) => sum + (p.variants?.length || 0), 0);

  // Get min price from variants
  const getMinPrice = (variants: any[] = []) => {
    if (!variants || variants.length === 0) return 0;
    return Math.min(...variants.map((v) => v.price));
  };

  // Get total stock
  const getTotalStock = (variants: any[] = []) => {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((sum, v) => sum + (v.stock || 0), 0);
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

  // Handle delete
  const handleDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id, {
        onSuccess: () => setDeleteDialogOpen(false),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Sản Phẩm</h1>
          <p className="text-muted-foreground">Quản lý sản phẩm, biến thể và nguyên liệu</p>
        </div>
        <Button
          onClick={() => {
            setProductToEdit(null);
            setFormDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm Sản Phẩm
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Sản Phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang Bán</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ngừng Bán</CardTitle>
            <EyeOff className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Biến Thể</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVariants}</div>
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
                  placeholder="Tìm kiếm sản phẩm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {Array.isArray(categories) && categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Ảnh</TableHead>
                <TableHead>Tên Sản Phẩm</TableHead>
                <TableHead>Danh Mục</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Tồn Kho</TableHead>
                <TableHead>Biến Thể</TableHead>
                <TableHead>Trạng Thái</TableHead>
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
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Không tìm thấy sản phẩm
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product: Product) => {
                  const images = Array.isArray(product.images) ? product.images : [];
                  const firstImage = images.length > 0 ? getImageUrl(images[0]) : '';

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                          {firstImage ? (
                            <Image
                              src={firstImage}
                              alt={product.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <Package className="w-full h-full p-4 text-gray-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category?.name || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        {getMinPrice(product.variants).toLocaleString('vi-VN')}đ
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            getTotalStock(product.variants) === 0
                              ? 'text-red-600 font-medium'
                              : getTotalStock(product.variants) < 10
                              ? 'text-orange-600 font-medium'
                              : ''
                          }
                        >
                          {getTotalStock(product.variants)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.variants?.length || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? 'default' : 'secondary'}>
                          {product.isActive ? 'Đang bán' : 'Ngừng bán'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ProductActions
                          product={product}
                          onEdit={() => {
                            setProductToEdit(product);
                            setFormDialogOpen(true);
                          }}
                          onDelete={() => {
                            setProductToDelete(product);
                            setDeleteDialogOpen(true);
                          }}
                        />
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
                {pagination.total} sản phẩm
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

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa sản phẩm &quot;{productToDelete?.title}&quot;? Hành động
              này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        product={productToEdit}
      />
    </div>
  );
}

// Product Actions Component
function ProductActions({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const updateMutation = useUpdateProduct(product.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Sửa
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            updateMutation.mutate({ isActive: !product.isActive });
          }}
        >
          {product.isActive ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Ngừng bán
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Bán lại
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-600" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
