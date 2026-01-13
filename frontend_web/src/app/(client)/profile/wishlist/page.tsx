'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Star, Trash2, ShoppingCart, Loader2, ImageIcon } from 'lucide-react';
import { getImageUrl, formatPrice } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { userApi } from '@/lib/api/user';
import { useCart } from '@/lib/hooks/use-cart';
import type { Product } from '@/types';

export default function WishlistPage() {
  const queryClient = useQueryClient();
  const { addItem } = useCart();

  const { data, isLoading, error } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      try {
        const response = await userApi.getWishlist();
        console.log('Raw wishlist response:', response);
        
        // Backend returns wishlists array with nested product
        const wishlists = (response.data || []) as any[];
        console.log('Wishlists array:', wishlists);
        
        if (!Array.isArray(wishlists)) {
          console.error('Wishlists is not array:', wishlists);
          return [];
        }
        
        const products = wishlists
          .map((w: any) => {
            if (!w || !w.product) {
              console.warn('Invalid wishlist item:', w);
              return null;
            }
            return w.product;
          })
          .filter(Boolean) as Product[];
        
        console.log('Processed products:', products);
        return products;
      } catch (err) {
        console.error('Wishlist fetch error:', err);
        throw err;
      }
    },
    retry: 2,
    staleTime: 0, // Always refetch to ensure fresh data
    refetchOnMount: true,
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      await userApi.toggleWishlist(productId);
      return productId;
    },
    onMutate: async (productId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });

      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData(['wishlist']);

      // Optimistically update to the new value
      queryClient.setQueryData(['wishlist'], (old: Product[] | undefined) => {
        return (old || []).filter(p => p.id !== productId);
      });

      // Return context with the snapshot
      return { previousWishlist };
    },
    onError: (err, productId, context) => {
      // Rollback on error
      if (context?.previousWishlist) {
        queryClient.setQueryData(['wishlist'], context.previousWishlist);
      }
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    },
    onSuccess: () => {
      toast.success('Đã xóa khỏi danh sách yêu thích');
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const handleAddToCart = (product: Product) => {
    // Find first available variant
    const availableVariant = product.variants?.find((v) => v.stock > 0);
    
    if (!availableVariant) {
      toast.error('Sản phẩm tạm hết hàng');
      return;
    }

    addItem({
      variantId: availableVariant.id,
      productId: product.id,
      title: product.title,
      image: product.images?.[0] || '',
      size: availableVariant.size,
      price: availableVariant.price,
      stock: availableVariant.stock,
      quantity: 1,
    });

    toast.success('Đã thêm vào giỏ hàng');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive mb-4">Không thể tải danh sách yêu thích</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['wishlist'] })}>
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Sản phẩm yêu thích ({data?.length || 0})
        </h1>
      </div>

      {/* Products Grid */}
      {data && data.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((product) => {
            const hasStock = product.variants?.some((v) => v.stock > 0) ?? false;
            const imageUrl = getImageUrl(product.images?.[0] || '');

            return (
              <Card key={product.id} className="group overflow-hidden">
                {/* Image */}
                <Link href={`/products/${product.slug}`} className="block">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.title || 'Product image'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
                        <ImageIcon className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    {!hasStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge variant="secondary">Hết hàng</Badge>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Content */}
                <div className="p-4">
                  <Link
                    href={`/products/${product.slug}`}
                    className="block hover:text-primary"
                  >
                    <h3 className="font-semibold line-clamp-2 mb-2">
                      {product.title}
                    </h3>
                  </Link>

                  <Badge variant="secondary" className="mb-3">
                    {product.category?.name || 'Chưa phân loại'}
                  </Badge>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium ml-1">
                        {product.avgRating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.totalReviews || 0} đánh giá)
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <p className="text-lg font-bold text-primary">
                      {product.variants?.[0]?.price ? formatPrice(product.variants[0].price) : '0'}đ
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAddToCart(product)}
                      disabled={!hasStock}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Thêm vào giỏ
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMutation.mutate(product.id)}
                      disabled={removeMutation.isPending}
                    >
                      {removeMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Danh sách yêu thích trống
          </h3>
          <p className="text-muted-foreground mb-6">
            Bạn chưa thêm sản phẩm nào vào danh sách yêu thích
          </p>
          <Button asChild>
            <Link href="/products">Khám phá sản phẩm</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
