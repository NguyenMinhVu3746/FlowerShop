import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, handleApiError } from '@/lib/response';

// Helper function to remove Vietnamese accents
function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    if (!q || q.trim().length < 2) {
      return successResponse({
        products: [],
        message: 'Vui lòng nhập ít nhất 2 ký tự để tìm kiếm',
      });
    }

    // Search with both original and unaccented query
    const normalizedQ = removeVietnameseAccents(q.toLowerCase());
    
    // Split query into words for better matching
    const queryWords = normalizedQ.split(/\s+/).filter(w => w.length > 0);

    // Get all products and filter in memory for Vietnamese accent-insensitive search
    const allProducts = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          select: {
            id: true,
            size: true,
            price: true,
            stock: true,
          },
          orderBy: {
            price: 'asc',
          },
        },
      },
    });

    // Filter products by normalized search
    const products = allProducts.filter((product) => {
      const normalizedTitle = removeVietnameseAccents(product.title.toLowerCase());
      const normalizedDesc = removeVietnameseAccents((product.description || '').toLowerCase());
      const normalizedKeywords = removeVietnameseAccents((product.metaKeywords || '').toLowerCase());
      const normalizedCategory = removeVietnameseAccents((product.category?.name || '').toLowerCase());
      
      const searchText = `${normalizedTitle} ${normalizedDesc} ${normalizedKeywords} ${normalizedCategory}`;
      
      // Match if ALL query words are found in the search text
      return queryWords.every(word => searchText.includes(word));
    }).slice(0, 20); // Limit to 20 results

    return successResponse({
      products,
      query: q,
      total: products.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
