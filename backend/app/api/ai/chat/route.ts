import { NextRequest } from 'next/server';
import { z } from 'zod';
import { errorResponse, successResponse } from '@/lib/response';
import { chatWithGemini, analyzeImageWithGemini } from '@/lib/gemini';
import { prisma } from '@/lib/prisma';

// Validation schema - hỗ trợ cả text và image
const chatSchema = z.object({
  message: z.string().optional(), // Text message (optional nếu chỉ gửi ảnh)
  image: z.string().optional(), // Base64 image (optional)
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        parts: z.union([
          z.string(),
          z.array(
            z.object({
              text: z.string().optional(),
              image: z.string().optional(),
            })
          ),
        ]),
      })
    )
    .optional(),
}).refine((data) => data.message || data.image, {
  message: 'Vui lòng cung cấp tin nhắn text hoặc hình ảnh',
});

/**
 * POST /api/ai/chat
 * Chat với Gemini AI để tư vấn hoa (hỗ trợ text + image)
 * Body: { 
 *   message?: string,
 *   image?: string (base64),
 *   conversationHistory?: Array 
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, image, conversationHistory } = chatSchema.parse(body);

    // Xử lý ảnh nếu có
    let imageAnalysis = '';
    let imageKeywords: string[] = [];
    
    if (image) {
      try {
        const analysisPrompt = `
Phân tích bức ảnh hoa này và cho biết:
1. Loại hoa chính trong ảnh (hồng, tulip, lily, cúc, lan, v.v.)
2. Màu sắc chủ đạo
3. Phong cách cắm hoa (bó tròn, bình hoa, giỏ hoa, hộp hoa, v.v.)
4. Dịp phù hợp (sinh nhật, khai trương, cưới, chia buồn, v.v.)

Trả lời ngắn gọn bằng Tiếng Việt, tự nhiên như nhân viên tư vấn.
`;
        const analysis = await analyzeImageWithGemini(image, analysisPrompt);
        imageAnalysis = analysis;
        
        // Trích xuất từ khóa từ phân tích ảnh
        const lowerAnalysis = analysis.toLowerCase();
        const flowerTypes = ['hồng', 'tulip', 'lily', 'cúc', 'lan', 'sen', 'baby', 'hướng dương', 'cẩm chướng', 'đồng tiền', 'ly'];
        imageKeywords = flowerTypes.filter(flower => lowerAnalysis.includes(flower));
        
        console.log('[Image Analysis]:', imageAnalysis);
        console.log('[Image Keywords]:', imageKeywords);
      } catch (error) {
        console.error('Image analysis error:', error);
        imageAnalysis = 'Không thể phân tích ảnh. Vui lòng mô tả bằng lời.';
      }
    }

    // Build system context
    const systemContext = `
Bạn là trợ lý AI của Hoa Shop - cửa hàng hoa tươi trực tuyến.

NHIỆM VỤ:
- Tư vấn khách hàng chọn hoa phù hợp
- Trả lời NGẮN GỌN, TỰ NHIÊN như nhân viên bán hàng
- Nếu có sản phẩm: giới thiệu 2-3 sản phẩm NỔI BẬT nhất (tên + giá)
- KHÔNG liệt kê hết danh sách, KHÔNG copy paste toàn bộ database

PHONG CÁCH:
- Thân thiện, nhiệt tình nhưng NGẮN GỌN
- Ngôn ngữ: Tiếng Việt tự nhiên
- Độ dài: 3-5 câu tối đa

${image ? `[PHÂN TÍCH ẢNH]: ${imageAnalysis}\n` : ''}${message ? `Khách hàng hỏi: ${message}` : 'Khách hàng gửi ảnh hoa và muốn tìm sản phẩm tương tự.'}
`;

    // STEP 1: Extract flower keywords từ text hoặc image
    let productSuggestions = null;
    let searchContext = '';
    
    // Define flower types and occasions
    const flowerTypes: Record<string, string[]> = {
      'hồng': ['hồng', 'rose', 'hong', 'h?ng', 'hông'],
      'tulip': ['tulip'],
      'lily': ['lily', 'ly'],
      'cúc': ['cúc', 'daisy', 'cuc'],
      'lan': ['lan', 'orchid'],
      'sen': ['sen', 'lotus'],
      'baby': ['baby'],
      'hướng dương': ['hướng dương', 'sunflower', 'huong duong'],
      'cẩm chướng': ['cẩm chướng', 'carnation', 'cam chuong'],
      'đồng tiền': ['đồng tiền', 'dong tien'],
    };
    
    const occasions: Record<string, string[]> = {
      'sinh nhật': ['sinh nhật', 'birthday'],
      'khai trương': ['khai trương', 'opening'],
      'cưới': ['cưới', 'wedding'],
      'chia buồn': ['chia buồn', 'funeral'],
      'tốt nghiệp': ['tốt nghiệp', 'graduation'],
      'valentine': ['valentine', 'tình yêu'],
    };
    
    // Extract flower keywords from message và image
    const messageLower = (message || '').toLowerCase();
    const matchedFlowers: string[] = [...imageKeywords]; // Bắt đầu với keywords từ ảnh
    const matchedOccasions: string[] = [];
    
    console.log('[Search] Message:', messageLower);
    console.log('[Search] Image Keywords:', imageKeywords);
    
    // Check for flower types trong text message
    if (message) {
      Object.entries(flowerTypes).forEach(([flower, keywords]) => {
        const matched = keywords.some(kw => messageLower.includes(kw));
        console.log(`[Search] Checking "${flower}" with keywords ${keywords}: ${matched}`);
        if (matched && !matchedFlowers.includes(flower)) {
          matchedFlowers.push(flower);
        }
      });
      
      // Check for occasions
      Object.entries(occasions).forEach(([occasion, keywords]) => {
        if (keywords.some(kw => messageLower.includes(kw))) {
          matchedOccasions.push(occasion);
        }
      });
    }
    
    console.log('[Search] Matched Flowers:', matchedFlowers);
    console.log('[Search] Matched Occasions:', matchedOccasions);
    
    try {
      // Only search if we found specific flower types or occasions
      if (matchedFlowers.length > 0 || matchedOccasions.length > 0) {
        const searchConditions: any[] = [];
        
        // Search by flower name in title/description
        if (matchedFlowers.length > 0) {
          matchedFlowers.forEach(flower => {
            searchConditions.push(
              { title: { contains: flower } },
              { description: { contains: flower } }
            );
          });
        }
        
        // Search by occasion/category
        if (matchedOccasions.length > 0) {
          matchedOccasions.forEach(occasion => {
            searchConditions.push(
              { title: { contains: occasion } },
              { description: { contains: occasion } },
              { category: { name: { contains: occasion } } }
            );
          });
        }
        
        const products = await prisma.product.findMany({
          where: {
            isActive: true,
            OR: searchConditions,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            images: true,
            category: {
              select: { name: true }
            },
            variants: {
              where: { isActive: true },
              select: { size: true, price: true, stock: true },
              orderBy: { price: 'asc' },
            },
            _count: {
              select: { reviews: true },
            },
          },
        });
        
        // Sort by relevance: prioritize products with matched flower names in title
        const sortedProducts = products.sort((a, b) => {
          const aHasFlower = matchedFlowers.some(f => 
            a.title.toLowerCase().includes(f) || 
            (a.description && a.description.toLowerCase().includes(f))
          );
          const bHasFlower = matchedFlowers.some(f => 
            b.title.toLowerCase().includes(f) ||
            (b.description && b.description.toLowerCase().includes(f))
          );
          if (aHasFlower && !bHasFlower) return -1;
          if (!aHasFlower && bHasFlower) return 1;
          return b._count.reviews - a._count.reviews; // Sort by review count
        }).slice(0, 5);

        if (sortedProducts.length > 0) {
          productSuggestions = sortedProducts.map((p: any) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            description: p.description,
            image: Array.isArray(p.images) ? p.images[0] : null,
            category: { name: p.category.name },
            prices: p.variants.map((v: any) => ({ size: v.size, price: v.price, stock: v.stock })),
            reviewCount: p._count.reviews,
          }));
          
          // Build context for AI - ONLY show top 3 products
          const searchTerms = [...matchedFlowers, ...matchedOccasions].join(', ');
          const topProducts = sortedProducts.slice(0, 3);
          
          searchContext = `\n\n[DATABASE] Tìm thấy ${sortedProducts.length} sản phẩm "${searchTerms}". TOP 3:\n${topProducts.map((p: any, i: number) => {
            const minPrice = p.variants[0]?.price.toLocaleString();
            return `${i + 1}. ${p.title} - ${minPrice}đ`;
          }).join('\n')}${sortedProducts.length > 3 ? `\n(+ ${sortedProducts.length - 3} sản phẩm khác)` : ''}

HƯỚNG DẪN TRẢ LỜI:
- Xác nhận có ${sortedProducts.length} sản phẩm
- Giới thiệu 2-3 sản phẩm trên với giá
- Gợi ý khách xem thêm nếu cần
- TỐI ĐA 4-5 câu ngắn!`;
        } else {
          const searchTerms = [...matchedFlowers, ...matchedOccasions].join(', ');
          searchContext = `\n\n[DATABASE] KHÔNG có sản phẩm "${searchTerms}".\nTRẢ LỜI: "Shop hiện chưa có ${searchTerms} ạ. Bạn cần tìm loại hoa nào khác không?"`;
        }
      }
    } catch (error) {
      console.error('Product search error:', error);
    }
    
    // Get AI response WITH product context
    const enhancedContext = systemContext + searchContext;
    const aiResponse = await chatWithGemini(enhancedContext, conversationHistory);

    return successResponse({
      response: aiResponse,
      suggestions: productSuggestions,
      imageAnalysis: image ? imageAnalysis : null, // Trả về phân tích ảnh nếu có
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }
    console.error('AI chat error:', error);
    return errorResponse('Không thể kết nối với AI. Vui lòng thử lại sau', 500);
  }
}
