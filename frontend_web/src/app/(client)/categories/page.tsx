'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { productApi } from '@/lib/api/product';
import { getImageUrl } from '@/lib/utils/image';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await productApi.getCategories();
      console.log('Categories API response:', response);
      // response.data can be { categories: [...] } or direct array
      const categories = response.data?.categories || response.data || [];
      console.log('Parsed categories:', categories);
      return Array.isArray(categories) ? categories : [];
    },
  });

  console.log('Categories data:', data, 'isLoading:', isLoading, 'error:', error);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  // Flatten all categories (parent and children) into one array
  const allCategories: any[] = [];
  (data || []).forEach((parent: any) => {
    // Add parent
    allCategories.push(parent);
    // Add children
    if (parent.children && parent.children.length > 0) {
      allCategories.push(...parent.children);
    }
  });

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Danh mục sản phẩm</h1>
        <p className="text-muted-foreground">
          Khám phá các bộ sưu tập hoa theo dịp và phong cách
        </p>
      </div>

      {/* All Categories Grid */}
      {allCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allCategories.map((category: any) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="block"
            >
              <Card className="group overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {category.image ? (
                    <Image
                      src={getImageUrl(category.image)}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
                      <span className="text-6xl font-bold text-primary/20">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  {category._count?.products !== undefined && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {category._count.products} sản phẩm
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Chưa có danh mục nào</p>
        </div>
      )}
    </div>
  );
}
