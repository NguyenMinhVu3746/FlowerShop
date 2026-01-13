/**
 * PRODUCTS LISTING PAGE
 * =====================
 * Product grid with filters, sort, infinite scroll
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { productApi, userApi } from '@/lib/api';
import { useAuth } from '@/lib/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight, Heart, ShoppingCart } from 'lucide-react';
import { getImageUrl, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCart } from '@/lib/hooks';
import type { Product, ProductVariant } from '@/types';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { addItem } = useCart();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc' | 'best_selling' | 'rating'>('newest');
  const limit = 12;
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch wishlist
  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      const response = await userApi.getWishlist();
      const wishlists = (response.data || []) as any[];
      return wishlists.map((w: any) => w.productId);
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60, // 1 minute
    refetchOnMount: true,
  });

  const wishlistIds = wishlistData || [];

  // Fetch products
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', { page, sort, category: categorySlug }],
    queryFn: async () => {
      const response = await productApi.getProducts({
        page,
        limit,
        sort,
        category: categorySlug || undefined,
      });
      console.log('Products API Response:', {
        total: response.data?.pagination?.total,
        totalPages: response.data?.pagination?.totalPages,
        currentPage: response.data?.pagination?.page,
        productsCount: response.data?.products?.length,
      });
      return response.data;
    },
  });

  const products = data?.products || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const total = data?.pagination?.total || 0;
  const hasMore = page < totalPages;

  // Accumulate products for infinite scroll
  useEffect(() => {
    if (products.length > 0) {
      if (page === 1) {
        setAllProducts(products);
      } else {
        setAllProducts((prev) => {
          // Filter out duplicates by product ID
          const existingIds = new Set(prev.map(p => p.id));
          const newProducts = products.filter(p => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
      }
    }
  }, [products, page]);

  // Reset when filters change
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
  }, [sort, categorySlug]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    console.log('Observer effect:', { 
      hasRef: !!loadMoreRef.current, 
      hasMore, 
      isFetching,
      page 
    });

    if (!loadMoreRef.current || !hasMore || isFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        console.log('Observer triggered:', { 
          isIntersecting: entries[0].isIntersecting, 
          hasMore, 
          isFetching 
        });
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          console.log('Loading next page...');
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );

    const element = loadMoreRef.current;
    observer.observe(element);
    console.log('Observer attached to element');

    return () => {
      console.log('Observer disconnected');
      observer.disconnect();
    };
  }, [hasMore, isFetching, page]);

  const handleToggleWishlist = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    // Optimistically update UI
    const isCurrentlyInWishlist = wishlistIds.includes(productId);
    queryClient.setQueryData(['wishlist'], (old: string[] | undefined) => {
      const current = old || [];
      if (isCurrentlyInWishlist) {
        return current.filter(id => id !== productId);
      } else {
        return [...current, productId];
      }
    });

    try {
      await userApi.toggleWishlist(productId);
      toast.success(isCurrentlyInWishlist ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData(['wishlist'], wishlistIds);
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleOpenAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProduct(product);
    setSelectedVariant(product.variants.find(v => v.stock > 0) || product.variants[0] || null);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !selectedVariant) return;

    if (quantity > selectedVariant.stock) {
      toast.error('Số lượng vượt quá tồn kho');
      return;
    }

    addItem({
      variantId: selectedVariant.id,
      productId: selectedProduct.id,
      title: selectedProduct.title,
      image: selectedProduct.images?.[0] || '',
      size: selectedVariant.size,
      price: selectedVariant.price,
      stock: selectedVariant.stock,
      quantity,
    });

    toast.success('Đã thêm vào giỏ hàng');
    setSelectedProduct(null);
    setSelectedVariant(null);
    setQuantity(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">{/* Dialog for variant selection */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chọn kích thước</DialogTitle>
            <DialogDescription>
              {selectedProduct?.title}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4">
              {/* Variants */}
              <div>
                <label className="mb-2 block text-sm font-semibold">Size:</label>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.variants.map((variant) => (
                    <Button
                      key={variant.id}
                      variant={selectedVariant?.id === variant.id ? 'default' : 'outline'}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.stock === 0}
                      className="flex-1 min-w-[100px]"
                    >
                      <div className="flex flex-col items-center">
                        <span>{variant.size}</span>
                        <span className="text-xs">{formatPrice(variant.price)}đ</span>
                      </div>
                    </Button>
                  ))}
                </div>
                {selectedVariant && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Còn {selectedVariant.stock} sản phẩm
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="mb-2 block text-sm font-semibold">Số lượng:</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setQuantity((q) => Math.min(selectedVariant?.stock || 999, q + 1))
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Add to cart button */}
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Thêm vào giỏ hàng
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            {categorySlug ? 'Sản phẩm theo danh mục' : 'Tất cả sản phẩm'}
          </h1>
          {data && (
            <p className="text-sm text-gray-600">
              Tìm thấy {data.total} sản phẩm
            </p>
          )}
        </div>

        {/* Sort */}
        <Select value={sort} onValueChange={(value: any) => setSort(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="best_selling">Bán chạy</SelectItem>
            <SelectItem value="rating">Đánh giá cao</SelectItem>
            <SelectItem value="price_asc">Giá thấp đến cao</SelectItem>
            <SelectItem value="price_desc">Giá cao đến thấp</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {isLoading && page === 1 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      ) : allProducts.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-600">Không tìm thấy sản phẩm nào</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {allProducts.map((product) => {
              const isInWishlist = wishlistIds.includes(product.id);
              return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group"
              >
                <Card className="h-full overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={getImageUrl(product.images?.[0])}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                      unoptimized
                    />
                    {/* Wishlist button */}
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-2 right-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white"
                      onClick={(e) => handleToggleWishlist(product.id, e)}
                    >
                      <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    {/* Stock badge */}
                    {product.variants.every(v => v.stock === 0) && (
                      <Badge className="absolute bottom-2 left-2" variant="destructive">
                        Hết hàng
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="mb-1 line-clamp-2 font-semibold">
                      {product.title}
                    </h3>
                    <p className="mb-2 text-sm text-gray-600">
                      {product.category?.name || 'Chưa phân loại'}
                    </p>
                    
                    {/* Rating */}
                    {product.avgRating && product.totalReviews ? (
                      <div className="mb-2 flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">
                          {product.avgRating.toFixed(1)}
                        </span>
                        <span className="text-gray-500">
                          ({product.totalReviews})
                        </span>
                      </div>
                    ) : null}

                    {/* Price */}
                    {product.variants.length > 0 && (
                      <p className="text-lg font-bold text-primary mb-3">
                        {product.variants?.[0]?.price ? formatPrice(product.variants[0].price) : '0'}đ
                        {product.variants.length > 1 && (
                          <span className="text-sm font-normal text-gray-500">
                            {' '}
                            - {formatPrice(product.variants[product.variants.length - 1].price)}đ
                          </span>
                        )}
                      </p>
                    )}

                    {/* Add to cart button */}
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={(e) => handleOpenAddToCart(product, e)}
                      disabled={product.variants.every(v => v.stock === 0)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Thêm vào giỏ
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )})}
          </div>
        </>
      )}

      {/* Infinite Scroll Trigger & Loading */}
      <div ref={loadMoreRef} className="mt-8 flex flex-col items-center gap-4">
        {isFetching && page > 1 && (
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Đang tải thêm...</span>
          </div>
        )}
        
        {!hasMore && allProducts.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Đã hiển thị tất cả {total} sản phẩm
          </p>
        )}
      </div>
    </div>
  );
}
