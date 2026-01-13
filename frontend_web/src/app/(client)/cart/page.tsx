/**
 * CART PAGE
 * =========
 * Shopping cart with update quantity, remove items
 */

'use client';

import { useCart } from '@/lib/hooks';
import { getImageUrl, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="mx-auto max-w-md">
          <CardContent className="py-12 text-center">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h2 className="mb-2 text-xl font-semibold">Giỏ hàng trống</h2>
            <p className="mb-6 text-gray-600">
              Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm
            </p>
            <Button asChild>
              <Link href="/products">Mua sắm ngay</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">Giỏ hàng ({totalItems})</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.variantId}>
                    <div className="flex gap-4">
                      {/* Image */}
                      <Link
                        href={`/products/${item.productId}`}
                        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded bg-gray-100"
                      >
                        {item.image && (
                          <Image
                            src={getImageUrl(item.image)}
                            alt={item.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <Link
                            href={`/products/${item.productId}`}
                            className="font-semibold hover:text-primary"
                          >
                            {item.title}
                          </Link>
                          <p className="text-sm text-gray-600">Size: {item.size}</p>
                          <p className="mt-1 font-semibold text-primary">
                            {formatPrice(item.price || 0)}đ
                          </p>
                        </div>

                        {/* Quantity & Remove */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => removeItem(item.variantId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Tóm tắt đơn hàng</h2>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính ({totalItems} sản phẩm)</span>
                  <span className="font-semibold">
                    {formatPrice(totalPrice)}đ
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Phí giao hàng</span>
                  <span className="font-semibold">
                    {totalPrice >= 500000 ? 'Miễn phí' : '30,000đ'}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary">
                    {formatPrice(totalPrice + (totalPrice >= 500000 ? 0 : 30000))}đ
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="mt-6 w-full"
                onClick={() => router.push('/checkout')}
              >
                Tiến hành thanh toán
              </Button>

              <Button
                variant="outline"
                className="mt-2 w-full"
                asChild
              >
                <Link href="/products">Tiếp tục mua sắm</Link>
              </Button>

              {totalPrice < 500000 && (
                <p className="mt-4 text-center text-sm text-gray-600">
                  Mua thêm {formatPrice(500000 - totalPrice)}đ để được miễn phí
                  ship
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
