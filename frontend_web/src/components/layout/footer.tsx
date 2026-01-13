/**
 * FOOTER COMPONENT
 * ================
 * Site footer with links, info, social
 */

import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Về Hoa Shop</h3>
            <p className="text-sm text-gray-600">
              Chuyên cung cấp hoa tươi chất lượng cao, giao hàng nhanh chóng tận nơi.
              Phục vụ 24/7.
            </p>
            <div className="mt-4 flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Liên kết</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-gray-600 hover:text-primary">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-600 hover:text-primary">
                  Danh mục
                </Link>
              </li>
              <li>
                <Link href="/ai-chat" className="text-gray-600 hover:text-primary">
                  AI Tư vấn
                </Link>
              </li>
              <li>
                <Link href="/ai-scan" className="text-gray-600 hover:text-primary">
                  AI Nhận Diện Hoa
                </Link>
              </li>
              <li>
                <Link href="/ai-video" className="text-gray-600 hover:text-primary">
                  AI Video
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-primary">
                  Về chúng tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/profile/orders" className="text-gray-600 hover:text-primary">
                  Tra cứu đơn hàng
                </Link>
              </li>
              <li>
                <Link href="/#" className="text-gray-600 hover:text-primary">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link href="/#" className="text-gray-600 hover:text-primary">
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link href="/#" className="text-gray-600 hover:text-primary">
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Liên hệ</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex gap-2">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </li>
              <li className="flex gap-2">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span>0123 456 789</span>
              </li>
              <li className="flex gap-2">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>contact@hoashop.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Hoa Shop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
