/**
 * PRODUCT DETAIL PAGE
 * ===================
 * Product info, images, variants, add to cart, reviews
 */

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productApi, userApi } from '@/lib/api';
import { useCart, useAuth } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Minus, Plus, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { getImageUrl, formatPrice } from '@/lib/utils';
import type { ProductVariant } from '@/types';
import { ReviewsSection } from '@/components/reviews/reviews-section';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const queryClient = useQueryClient();
  
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);

  // Fetch product
  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await productApi.getProductBySlug(slug);
      return response.data;
    },
  });

  const product = data?.product;
  const relatedProducts = data?.relatedProducts || [];

  // Check if product is in wishlist
  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      const response = await userApi.getWishlist();
      const wishlists = (response.data || []) as any[];
      return wishlists.map((w: any) => w.productId);
    },
    enabled: isAuthenticated,
  });

  const isInWishlist = product ? (wishlistData || []).includes(product.id) : false;

  // Auto-select first variant
  if (product && !selectedVariant && product.variants.length > 0) {
    setSelectedVariant(product.variants[0]);
  }

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Vui lòng chọn size');
      return;
    }

    if (quantity > selectedVariant.stock) {
      toast.error('Số lượng vượt quá tồn kho');
      return;
    }

    addItem({
      variantId: selectedVariant.id,
      productId: product!.id,
      title: product!.title,
      image: product!.images[0],
      size: selectedVariant.size,
      price: selectedVariant.price,
      stock: selectedVariant.stock,
      quantity,
    });

    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    try {
      await userApi.toggleWishlist(product!.id);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Đã cập nhật danh sách yêu thích');
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="h-[500px] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={getImageUrl(product.images[mainImage]) || '/placeholder.png'}
              alt={product.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setMainImage(index)}
                  className={`relative aspect-square overflow-hidden rounded border-2 ${
                    mainImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <Image 
                    src={getImageUrl(image)} 
                    alt={`${product.title} ${index + 1}`} 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge>{product.category?.name || 'Chưa phân loại'}</Badge>
              {product.avgRating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.avgRating.toFixed(1)}</span>
                  <span className="text-gray-500">({product.totalReviews} đánh giá)</span>
                </div>
              )}
            </div>
            
            <h1 className="text-2xl font-bold md:text-3xl">{product.title}</h1>
            
            {selectedVariant && (
              <p className="mt-2 text-3xl font-bold text-primary">
                {formatPrice(selectedVariant.price)}đ
              </p>
            )}
          </div>

          {/* Variants */}
          <div>
            <label className="mb-2 block font-semibold">Chọn size:</label>
            <div className="flex gap-2">
              {product.variants.map((variant) => (
                <Button
                  key={variant.id}
                  variant={selectedVariant?.id === variant.id ? 'default' : 'outline'}
                  onClick={() => setSelectedVariant(variant)}
                  disabled={variant.stock === 0}
                >
                  {variant.size}
                  {variant.stock === 0 && ' (Hết hàng)'}
                </Button>
              ))}
            </div>
            {selectedVariant?.description && (
              <p className="mt-2 text-sm text-gray-600">{selectedVariant.description}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-2 block font-semibold">Số lượng:</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setQuantity((q) => Math.min(selectedVariant?.stock || 999, q + 1))
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {selectedVariant && (
                <span className="text-sm text-gray-600">
                  Còn {selectedVariant.stock} sản phẩm
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button size="lg" className="flex-1" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Thêm vào giỏ
            </Button>
            <Button 
              size="lg" 
              variant={isInWishlist ? "default" : "outline"}
              onClick={handleToggleWishlist}
              className={isInWishlist ? "bg-red-500 hover:bg-red-600" : ""}
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-white' : ''}`} />
            </Button>
          </div>

          {/* Additional Info */}
          <Card className="p-4 bg-blue-50 dark:bg-blue-950">
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-xl">✓</span>
                <span>Hoa tươi nhập khẩu & trong nước cao cấp</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xl">✓</span>
                <span>Thiết kế & gói hoa bởi florist chuyên nghiệp</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xl">✓</span>
                <span>Miễn phí thiệp chúc mừng</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xl">✓</span>
                <span>Giao hoa nhanh trong 2-4h tại TP.HCM</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="description" className="flex-1 sm:flex-none">
              Mô tả sản phẩm
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1 sm:flex-none">
              Đánh giá ({product.totalReviews || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <ReviewsSection productId={product.id} slug={slug} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Sản phẩm tương tự</h2>
            <Link href="/products" className="text-primary hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.slice(0, 4).map((relatedProduct) => {
              const relatedIsInWishlist = (wishlistData || []).includes(relatedProduct.id);
              return (
              <Link key={relatedProduct.id} href={`/products/${relatedProduct.slug}`} className="group">
                <Card className="h-full overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={getImageUrl(relatedProduct.images?.[0])}
                      alt={relatedProduct.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-110"
                      unoptimized
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-2 right-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isAuthenticated) {
                          toast.error('Vui lòng đăng nhập');
                          return;
                        }
                        userApi.toggleWishlist(relatedProduct.id).then(() => {
                          queryClient.invalidateQueries({ queryKey: ['wishlist'] });
                          toast.success('Đã cập nhật danh sách yêu thích');
                        });
                      }}
                    >
                      <Heart className={`h-4 w-4 ${relatedIsInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="mb-1 line-clamp-2 font-semibold group-hover:text-primary transition-colors">
                      {relatedProduct.title}
                    </h3>
                    {relatedProduct.avgRating && relatedProduct.totalReviews ? (
                      <div className="flex items-center gap-1 text-sm mb-2">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{relatedProduct.avgRating.toFixed(1)}</span>
                        <span className="text-gray-500">({relatedProduct.totalReviews})</span>
                      </div>
                    ) : null}
                    <p className="text-lg font-bold text-primary">
                      {relatedProduct.variants?.[0]?.price ? formatPrice(relatedProduct.variants[0].price) : '0'}đ
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )})}
          </div>
        </div>
      )}
    </div>
  );
}
