'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { Search as SearchIcon, Star, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { productApi } from '@/lib/api/product';
import { getImageUrl, formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query) return { products: [] };
      const response = await productApi.searchProducts(query);
      return response.data;
    },
    enabled: query.length > 0,
  });

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Kết quả tìm kiếm</h1>
        {query && (
          <p className="text-muted-foreground">
            Tìm kiếm cho: &quot;<span className="font-medium">{query}</span>
            &quot;
            {data && (
              <span className="ml-2">
                ({data.products.length} sản phẩm)
              </span>
            )}
          </p>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      )}

      {/* No Query */}
      {!query && !isLoading && (
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <SearchIcon className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Nhập từ khóa để tìm kiếm
          </h3>
          <p className="text-muted-foreground mb-6">
            Sử dụng thanh tìm kiếm ở trên để tìm sản phẩm bạn cần
          </p>
          <Button asChild>
            <Link href="/products">Khám phá sản phẩm</Link>
          </Button>
        </div>
      )}

      {/* Results */}
      {query && !isLoading && data && (
        <>
          {data.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.products.map((product: Product) => {
                const hasStock = product.variants.some((v) => v.stock > 0);
                const minPrice = product.variants[0]?.price || 0;
                const maxPrice = product.variants[product.variants.length - 1]?.price || 0;

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="block"
                  >
                    <Card className="group overflow-hidden h-full hover:shadow-lg transition-shadow">
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <Image
                          src={getImageUrl(product.images?.[0])}
                          alt={product.title}
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

                      {/* Content */}
                      <div className="p-4">
                        <Badge variant="secondary" className="mb-2">
                          {product.category?.name || 'Chưa phân loại'}
                        </Badge>

                        <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {product.title}
                        </h3>

                        {product.avgRating && product.totalReviews ? (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium ml-1">
                                {product.avgRating.toFixed(1)}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              ({product.totalReviews})
                            </span>
                          </div>
                        ) : null}

                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(minPrice)}đ
                          </span>
                          {minPrice !== maxPrice && (
                            <span className="text-sm text-muted-foreground">
                              - {formatPrice(maxPrice)}đ
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-muted-foreground mb-6">
                Không có sản phẩm nào phù hợp với từ khóa &quot;{query}&quot;
                <br />
                Hãy thử tìm kiếm với từ khóa khác
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
