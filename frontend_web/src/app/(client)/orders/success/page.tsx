'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, Phone, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import confetti from 'canvas-confetti';

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // TODO: Add confetti celebration effect
    // confetti({
    //   particleCount: 100,
    //   spread: 70,
    //   origin: { y: 0.6 },
    // });
  }, []);

  if (!orderId) {
    router.push('/');
    return null;
  }

  return (
    <div className="container mx-auto max-w-2xl py-16 px-4">
      {/* Success Icon */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Đặt hàng thành công!</h1>
        <p className="text-muted-foreground">
          Cảm ơn bạn đã tin tưởng và mua sắm tại Hoa Shop
        </p>
      </div>

      {/* Order Info Card */}
      <div className="bg-card border rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng</p>
            <p className="text-lg font-bold">#{orderId}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Trạng thái</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              Chờ xác nhận
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Đơn hàng đang được xử lý</p>
              <p className="text-sm text-muted-foreground">
                Chúng tôi sẽ xác nhận đơn hàng của bạn trong vòng 24h
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Nhận thông tin qua SMS/Email</p>
              <p className="text-sm text-muted-foreground">
                Bạn sẽ nhận được cập nhật về đơn hàng qua số điện thoại và
                email đã đăng ký
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Theo dõi đơn hàng</p>
              <p className="text-sm text-muted-foreground">
                Bạn có thể kiểm tra tình trạng đơn hàng trong mục &quot;Đơn
                hàng của tôi&quot;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Support Info */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium mb-1">Cần hỗ trợ?</p>
            <p className="text-sm text-muted-foreground mb-2">
              Liên hệ với chúng tôi qua hotline hoặc email nếu bạn có bất kỳ
              thắc mắc nào
            </p>
            <div className="flex flex-col sm:flex-row gap-2 text-sm">
              <a
                href="tel:1900123456"
                className="text-primary hover:underline font-medium"
              >
                📞 Hotline: 1900 123 456
              </a>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <a
                href="mailto:support@hoashop.com"
                className="text-primary hover:underline font-medium"
              >
                ✉️ Email: support@hoashop.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1">
          <Link href={`/orders/${orderId}`}>Xem chi tiết đơn hàng</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/products">Tiếp tục mua sắm</Link>
        </Button>
      </div>

      {/* Promo Banner */}
      <div className="mt-8 text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
        <p className="text-sm font-medium mb-2">🎁 Ưu đãi đặc biệt</p>
        <p className="text-sm text-muted-foreground mb-3">
          Giảm 10% cho đơn hàng tiếp theo khi bạn đánh giá sản phẩm đã mua
        </p>
        <Button asChild size="sm" variant="outline">
          <Link href="/profile/orders">Xem đơn hàng của tôi</Link>
        </Button>
      </div>
    </div>
  );
}
