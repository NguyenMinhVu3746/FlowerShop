'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { User, Package, MapPin, Heart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/use-auth';
import { userApi } from '@/lib/api/user';
import { getImageUrl } from '@/lib/utils/image';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user: authUser, isAuthenticated } = useAuth();

  // Fetch latest user data
  const { data: userProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await userApi.getProfile();
      return response.data || null;
    },
    enabled: isAuthenticated,
  });

  // Use profile data if available, fallback to auth user
  const user = userProfile || authUser;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/profile');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const menuItems = [
    {
      href: '/profile',
      label: 'Thông tin cá nhân',
      icon: User,
    },
    {
      href: '/profile/orders',
      label: 'Đơn hàng của tôi',
      icon: Package,
    },
    {
      href: '/profile/addresses',
      label: 'Sổ địa chỉ',
      icon: MapPin,
    },
    {
      href: '/profile/wishlist',
      label: 'Sản phẩm yêu thích',
      icon: Heart,
    },
    {
      href: '/profile/settings',
      label: 'Cài đặt tài khoản',
      icon: Settings,
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <Card className="p-6">
            {/* User Info */}
            <div className="text-center mb-6 pb-6 border-b">
              {user?.avatar ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-3">
                  <Image
                    src={getImageUrl(user.avatar)}
                    alt={user.fullname || 'Avatar'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-white">
                    {user?.fullname?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <h3 className="font-semibold text-lg">{user?.fullname}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>

            {/* Menu */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}
