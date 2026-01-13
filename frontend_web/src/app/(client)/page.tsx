/**
 * CLIENT HOME PAGE
 * ================
 * Landing page with banners, categories, featured products
 */

'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productApi, userApi } from '@/lib/api';
import { useAuth, useCart } from '@/lib/hooks';
import { getImageUrl } from '@/lib/utils/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Star, Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import type { Product, ProductVariant } from '@/types';
import Autoplay from 'embla-carousel-autoplay';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { addItem } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  // Fetch banners
  const { data: bannersData, isLoading: bannersLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      const response = await productApi.getBanners();
      const banners = response.data?.banners || response.data || [];
      return Array.isArray(banners) ? banners : [];
    },
  });

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await productApi.getCategories();
      console.log('Categories response:', response);
      // Backend returns array directly in response.data
      const categories = response.data?.categories || response.data || [];
      return Array.isArray(categories) ? categories : [];
    },
  });

  // Fetch featured products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const response = await productApi.getProducts({
        page: 1,
        limit: 8,
        sort: 'best_selling',
      });
      return response.data?.products || [];
    },
  });

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
  });

  const wishlistIds = wishlistData || [];

  const handleToggleWishlist = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập');
      return;
    }
    try {
      await userApi.toggleWishlist(productId);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Đã cập nhật danh sách yêu thích');
    } catch (error) {
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
    <div className="space-y-12 pb-12">
      {/* Dialog for variant selection */}
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
              <div>
                <label className="mb-2 block text-sm font-semibold">Số lượng:</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                      -
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button variant="outline" size="icon" onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock || 999, q + 1))}>
                      +
                    </Button>
                  </div>
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={handleAddToCart} disabled={!selectedVariant || selectedVariant.stock === 0}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Thêm vào giỏ hàng
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hero Banner */}
      <section className="relative">
        {bannersLoading ? (
          <Skeleton className="h-[400px] md:h-[500px] w-full" />
        ) : bannersData && bannersData.length > 0 ? (
          <Carousel
            opts={{ loop: true }}
            plugins={[
              Autoplay({
                delay: 5000,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent>
              {bannersData.map((banner, index) => (
                <CarouselItem key={banner.id || index}>
                  <div className="relative h-[400px] md:h-[500px] bg-gradient-to-r from-pink-100 to-purple-100">
                    {banner.image ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={getImageUrl(banner.image)}
                          alt={banner.title}
                          fill
                          className="object-cover"
                          priority={index === 0}
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute inset-0 flex items-center">
                          <div className="container mx-auto px-4">
                            <div className="max-w-2xl text-white">
                              <h1 className="mb-4 text-4xl font-bold md:text-6xl">
                                {banner.title}
                              </h1>
                              <p className="mb-6 text-lg md:text-xl">
                                {banner.description}
                              </p>
                              <Button size="lg" asChild>
                                <Link href="/products">Mua sắm ngay</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full items-center">
                        <div className="container mx-auto px-4">
                          <div className="max-w-2xl">
                            <h1 className="mb-4 text-4xl font-bold md:text-6xl">
                              {banner.title}
                            </h1>
                            <p className="mb-6 text-lg text-gray-700 md:text-xl">
                              {banner.description}
                            </p>
                            <Button size="lg" asChild>
                              <Link href="/products">Mua sắm ngay</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 h-10 w-10 bg-white/90 backdrop-blur-sm hover:bg-white" />
            <CarouselNext className="right-4 h-10 w-10 bg-white/90 backdrop-blur-sm hover:bg-white" />
          </Carousel>
        ) : (
          <div className="relative h-[400px] md:h-[500px] bg-gradient-to-r from-pink-100 to-purple-100">
            <div className="flex h-full items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl">
                  <h1 className="mb-4 text-4xl font-bold md:text-6xl">
                    Hoa tươi đẹp, giao tận nơi
                  </h1>
                  <p className="mb-6 text-lg text-gray-700 md:text-xl">
                    Chuyên cung cấp hoa tươi chất lượng cao, phù hợp mọi dịp
                  </p>
                  <Button size="lg" asChild>
                    <Link href="/products">Mua sắm ngay</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold md:text-3xl">Danh mục nổi bật</h2>
          <Button variant="ghost" asChild>
            <Link href="/categories">
              Xem tất cả <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {categoriesLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categoriesData?.filter((cat) => !cat.parentId).slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group"
              >
                <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="relative h-40 bg-gray-100">
                    {category.image && (
                      <Image
                        src={getImageUrl(category.image)}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        unoptimized
                      />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{category.name}</h3>
                    {category.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                        {category.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold md:text-3xl">Sản phẩm nổi bật</h2>
          <Button variant="ghost" asChild>
            <Link href="/products">
              Xem tất cả <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {productsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {productsData?.map((product) => {
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
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-2 right-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white"
                      onClick={(e) => handleToggleWishlist(product.id, e)}
                    >
                      <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
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
        )}
      </section>

      {/* AI Chat CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-12">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">
            🤖 Không biết chọn hoa gì?
          </h2>
          <p className="mb-6 text-lg">
            Hãy để AI tư vấn miễn phí! Gửi ảnh hoặc mô tả nhu cầu của bạn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/ai-chat">Trò chuyện với AI</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/ai-scan">Nhận diện hoa bằng AI</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Floating Action Button for AI Scan */}
      <Link
        href="/ai-scan"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-red-700 text-white shadow-lg transition-all hover:bg-red-800 hover:scale-110"
        title="Quét hoa bằng AI"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
          />
        </svg>
      </Link>
    </div>
  );
}
