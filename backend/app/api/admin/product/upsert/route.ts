import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateUniqueSlug } from '@/lib/slug';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';
import { saveImageLocally, saveMultipleImagesLocally } from '@/lib/upload';
import { z } from 'zod';

// Validation schema
const variantSchema = z.object({
  size: z.enum(['S', 'M', 'L']),
  price: z.number().positive(),
  description: z.string().optional(),
  stock: z.number().int().min(0),
  isActive: z.boolean().optional().default(true),
});

const productUpsertSchema = z.object({
  id: z.string().optional(), // Nếu có id = update, không có = create
  title: z.string().min(1, 'Tên sản phẩm không được để trống'),
  description: z.string().optional(),
  images: z.array(z.string().min(1)), // Base64 hoặc URLs
  categoryId: z.string().min(1, 'Danh mục không được để trống'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  variants: z.array(variantSchema).optional().default([]),
});

/**
 * POST /api/admin/product/upsert
 * Tạo hoặc cập nhật sản phẩm kèm upload ảnh và variants
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await request.json();
    const validatedData = productUpsertSchema.parse(body);

    const isUpdate = !!validatedData.id;

    // 1. XỬ LÝ UPLOAD ẢNH
    const processedImages: string[] = [];
    
    for (const img of validatedData.images) {
      if (img.startsWith('data:image/')) {
        // Base64 image - upload lên local
        try {
          const result = await saveImageLocally(img, 'hoashop/products');
          processedImages.push(result.url);
        } catch (error) {
          console.error('Error uploading image:', error);
          // Skip ảnh lỗi
        }
      } else if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) {
        // URL đã tồn tại - giữ nguyên
        processedImages.push(img);
      }
    }

    if (processedImages.length === 0) {
      return errorResponse('Cần ít nhất 1 ảnh hợp lệ', 400);
    }

    // 2. KIỂM TRA CATEGORY TỒN TẠI
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      return errorResponse('Danh mục không tồn tại', 404);
    }

    let product;

    if (isUpdate) {
      // ============== UPDATE MODE ==============
      
      // Kiểm tra product tồn tại
      const existingProduct = await prisma.product.findUnique({
        where: { id: validatedData.id },
        include: { variants: true },
      });

      if (!existingProduct) {
        return errorResponse('Sản phẩm không tồn tại', 404);
      }

      // Update product
      product = await prisma.product.update({
        where: { id: validatedData.id },
        data: {
          title: validatedData.title,
          description: validatedData.description || null,
          images: processedImages,
          categoryId: validatedData.categoryId,
          metaTitle: validatedData.metaTitle || null,
          metaDescription: validatedData.metaDescription || null,
          metaKeywords: validatedData.metaKeywords || null,
          isActive: validatedData.isActive,
        },
      });

      // Update variants - XÓA HẾT CŨ, TẠO MỚI
      if (validatedData.variants && validatedData.variants.length > 0) {
        // Xóa variants cũ
        await prisma.productVariant.deleteMany({
          where: { productId: product.id },
        });

        // Tạo variants mới
        await prisma.productVariant.createMany({
          data: validatedData.variants.map((v) => ({
            productId: product.id,
            size: v.size,
            price: v.price,
            description: v.description || null,
            stock: v.stock,
            isActive: v.isActive ?? true,
          })),
        });
      }

    } else {
      // ============== CREATE MODE ==============
      
      // Generate unique slug
      const slug = await generateUniqueSlug(
        validatedData.title,
        async (slug) => {
          const existing = await prisma.product.findUnique({
            where: { slug },
          });
          return !!existing;
        }
      );

      // Tạo product
      product = await prisma.product.create({
        data: {
          title: validatedData.title,
          slug,
          description: validatedData.description || null,
          images: processedImages,
          categoryId: validatedData.categoryId,
          metaTitle: validatedData.metaTitle || null,
          metaDescription: validatedData.metaDescription || null,
          metaKeywords: validatedData.metaKeywords || null,
          isActive: validatedData.isActive,
        },
      });

      // Tạo variants
      if (validatedData.variants && validatedData.variants.length > 0) {
        await prisma.productVariant.createMany({
          data: validatedData.variants.map((v) => ({
            productId: product.id,
            size: v.size,
            price: v.price,
            description: v.description || null,
            stock: v.stock,
            isActive: v.isActive ?? true,
          })),
        });
      }
    }

    // 3. LOAD LẠI PRODUCT VỚI FULL DATA
    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: true,
      },
    });

    return successResponse(
      fullProduct,
      isUpdate ? 'Cập nhật sản phẩm thành công' : 'Tạo sản phẩm thành công',
      isUpdate ? 200 : 201
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message || 'Dữ liệu không hợp lệ';
      return errorResponse(message, 400);
    }
    console.error('Product upsert error:', error);
    return handleApiError(error);
  }
}
