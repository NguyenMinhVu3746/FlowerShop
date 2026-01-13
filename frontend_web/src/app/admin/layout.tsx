/**
 * ADMIN LAYOUT
 * ============
 * Admin dashboard layout with sidebar navigation
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  Ticket,
  Image as ImageIcon,
  FolderTree,
  BarChart3,
  Menu,
  X,
  LogOut,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNavItems = [
  {
    label: 'Tổng quan',
    icon: LayoutDashboard,
    href: '/admin',
  },
  {
    label: 'Sản phẩm',
    icon: Package,
    href: '/admin/products',
  },
  {
    label: 'Danh mục',
    icon: FolderTree,
    href: '/admin/categories',
  },
  {
    label: 'Đơn hàng',
    icon: ShoppingCart,
    href: '/admin/orders',
  },
  {
    label: 'Đánh giá',
    icon: MessageSquare,
    href: '/admin/reviews',
  },
  {
    label: 'Voucher',
    icon: Ticket,
    href: '/admin/vouchers',
  },
  {
    label: 'Banner',
    icon: ImageIcon,
    href: '/admin/banners',
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Protect admin routes
  React.useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, router]);

  // Show loading while user is being fetched
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not admin (will redirect via useEffect)
  if (user.role !== 'ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-sm text-muted-foreground">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                <span className="text-lg font-bold">A</span>
              </div>
              <span className="text-lg font-bold">Admin Panel</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Info + Actions */}
          <div className="border-t p-4">
            <div className="mb-3 rounded-lg bg-gray-50 p-3">
              <p className="text-sm font-semibold">{user.fullname}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  router.push('/');
                  setSidebarOpen(false);
                }}
              >
                <Home className="mr-2 h-4 w-4" />
                Về trang chủ
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <h1 className="text-xl font-semibold">
            {adminNavItems.find((item) => item.href === pathname)?.label || 'Admin'}
          </h1>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-gray-600 sm:inline">
              {user.fullname}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}
