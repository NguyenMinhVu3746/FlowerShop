'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Star, SlidersHorizontal } from 'lucide-react';
import { getImageUrl, formatPrice } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { productApi } from '@/lib/api/product';
import type { Product } from '@/types';

type SortOption = 'newest' | 'best_selling' | 'rating' | 'price_asc' | 'price_desc';

export default function CategoryDetailPage() {
  const params = useParams();
  const categorySlug = params.slug as string;
  const [sort, setSort] = useState<SortOption>('newest');
  const [page, setPage] = useState(1);

  // Get category info
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await productApi.getCategories();
      return response.data.categories;
    },
  });

  const category = categoriesData?.find((cat: any) => cat.slug === categorySlug);

  // Get products in category
  const { data, isLoading } = useQuery({
    queryKey: ['category-products', categorySlug, sort, page],
    queryFn: async () => {
      if (!category) return null;
      const response = await productApi.getProducts({
        categoryId: category.id,
        sortBy: sort,
        page,
        limit: 12,
      });
      return response.data;
    },
    enabled: !!category,
  });

  if (!category && !isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy danh mục</h2>
        <Button asChild>
          <Link href="/categories">Quay lại danh sách danh mục</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/categories">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Link>
      </Button>

      {/* Category Header */}
      {category && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground">{category.description}</p>
          )}
          {data && (
            <p className="text-sm text-muted-foreground mt-2">
              {data.total} sản phẩm
            </p>
          )}
        </div>
      )}

      {/* Filters & Sort */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Lọc và sắp xếp</span>
        </div>
        <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="best_selling">Bán chạy nhất</SelectItem>
            <SelectItem value="rating">Đánh giá cao</SelectItem>
            <SelectItem value="price_asc">Giá thấp đến cao</SelectItem>
            <SelectItem value="price_desc">Giá cao đến thấp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && data && (
        <>
          {data.products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.products.map((product: Product) => {
                  const hasStock = product.variants.some((v) => v.stock > 0);

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className="block"
                    >
                      <Card className="group overflow-hidden h-full hover:shadow-lg transition-shadow">
                        <div className="relative aspect-square overflow-hidden bg-muted">
                          <Image
                            src={getImageUrl(product.images?.[0])}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                          {!hasStock && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Badge variant="secondary">Hết hàng</Badge>
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <Badge variant="secondary" className="mb-2">
                            {product.category?.name || 'Chưa phân loại'}
                          </Badge>

                          <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>

                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium ml-1">
                                {product.avgRating.toFixed(1)}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              ({product.reviewCount})
                            </span>
                          </div>

                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-primary">
                              {formatPrice(product.minPrice)}đ
                            </span>
                            {product.minPrice !== product.maxPrice && (
                              <span className="text-sm text-muted-foreground">
                                - {formatPrice(product.maxPrice)}đ
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Trang trước
                  </Button>
                  <span className="text-sm">
                    Trang {page} / {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                  >
                    Trang sau
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-6">
                Chưa có sản phẩm nào trong danh mục này
              </p>
              <Button asChild>
                <Link href="/products">Xem tất cả sản phẩm</Link>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
