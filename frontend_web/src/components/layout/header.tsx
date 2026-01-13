/**
 * HEADER COMPONENT
 * ================
 * Main navigation with logo, search, cart, user menu
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ShoppingCart, Search, User, Menu, Heart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth, useCart } from '@/lib/hooks';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white" suppressHydrationWarning>
      

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden" suppressHydrationWarning>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4">
                <Link
                  href="/"
                  className="text-lg font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Trang chủ
                </Link>
                <Link
                  href="/products"
                  className="text-lg font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sản phẩm
                </Link>
                <Link
                  href="/categories"
                  className="text-lg font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Danh mục
                </Link>
                <Link
                  href="/ai-chat"
                  className="text-lg font-semibold text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  AI Tư vấn
                </Link>
                <Link
                  href="/ai-scan"
                  className="text-lg font-semibold text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  AI Nhận Diện Hoa
                </Link>
                <Link
                  href="/ai-video"
                  className="text-lg font-semibold text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  AI Video
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-10 w-10">
              <Image
                src="/favicon.ico"
                alt="Hoa Shop Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <span className="hidden text-xl font-bold sm:inline">Hoa Shop</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 lg:flex">
            <Link href="/" className="font-medium hover:text-primary">
              Trang chủ
            </Link>
            <Link href="/products" className="font-medium hover:text-primary">
              Sản phẩm
            </Link>
            <Link href="/categories" className="font-medium hover:text-primary">
              Danh mục
            </Link>
            <Link
              href="/ai-chat"
              className="font-medium text-primary hover:text-primary/80"
            >
              AI Tư vấn
            </Link>
            <Link
              href="/ai-scan"
              className="font-medium text-primary hover:text-primary/80"
            >
              AI Scan
            </Link>
            <Link
              href="/ai-video"
              className="font-medium text-primary hover:text-primary/80"
            >
              AI Video
            </Link>
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden flex-1 md:block md:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => router.push('/search')}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/profile/wishlist')}
              >
                <Heart className="h-5 w-5" />
              </Button>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => router.push('/cart')}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                  suppressHydrationWarning
                >
                  {totalItems > 9 ? '9+' : totalItems}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">{user?.fullname}</span>
                      <span className="text-xs text-gray-500">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Tài khoản
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile/orders')}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Đơn hàng
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile/wishlist')}>
                    <Heart className="mr-2 h-4 w-4" />
                    Yêu thích
                  </DropdownMenuItem>
                  {user?.role === 'ADMIN' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/admin')}>
                        <span className="mr-2">⚙️</span>
                        Quản trị
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => router.push('/auth/login')}>Đăng nhập</Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
