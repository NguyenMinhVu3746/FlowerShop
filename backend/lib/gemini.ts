/**
 * Google Gemini AI Service
 * Integrates with Gemini API for AI features
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Chat with Gemini AI (hỗ trợ text và multi-modal)
 */
export async function chatWithGemini(
  message: string,
  conversationHistory?: any[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Create chat with history if provided
    // Hỗ trợ cả text và parts array (text + image)
    const chat = model.startChat({
      history: conversationHistory ? conversationHistory.map((item: any) => {
        // Nếu parts là string, convert thành text part
        if (typeof item.parts === 'string') {
          return {
            role: item.role,
            parts: [{ text: item.parts }],
          };
        }
        // Nếu parts là array, filter bỏ image (chỉ giữ text)
        // Gemini API không chấp nhận field 'image' trong history
        if (Array.isArray(item.parts)) {
          const textParts = item.parts
            .filter((part: any) => part.text) // Chỉ giữ parts có text
            .map((part: any) => ({ text: part.text }));
          
          return {
            role: item.role,
            parts: textParts.length > 0 ? textParts : [{ text: '[User sent an image]' }],
          };
        }
        return {
          role: item.role,
          parts: item.parts,
        };
      }) : [],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    
    console.log('[Gemini Response]:', text); // Debug log
    return text;
  } catch (error: any) {
    console.error('Gemini chat error:', error?.message || error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw new Error(`AI chat failed: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Analyze image with Gemini Vision
 */
export async function analyzeImageWithGemini(
  base64Image: string,
  prompt: string = 'Describe this image in detail'
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Remove data:image prefix if exists
    const imageData = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg',
        },
      },
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini vision error:', error);
    throw new Error('Image analysis failed');
  }
}

/**
 * Search flowers by image description
 */
export async function searchFlowersByImage(base64Image: string): Promise<{
  description: string;
  keywords: string[];
  suggestions: string;
}> {
  const prompt = `
Analyze this flower image and provide:
1. Detailed description of the flowers (type, color, arrangement)
2. Keywords for searching (separate by commas)
3. Suggestions for occasions suitable for this bouquet

Format your response as JSON:
{
  "description": "detailed description",
  "keywords": ["keyword1", "keyword2", ...],
  "suggestions": "occasion suggestions"
}
`;

  try {
    const result = await analyzeImageWithGemini(base64Image, prompt);
    
    // Try to parse JSON response
    try {
      return JSON.parse(result);
    } catch {
      // If not valid JSON, return structured format
      return {
        description: result,
        keywords: extractKeywords(result),
        suggestions: 'Phù hợp cho nhiều dịp khác nhau',
      };
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Generate greeting card message
 */
export async function generateGreetingMessage(params: {
  occasion: string;
  recipient: string;
  relationship: string;
  tone?: 'formal' | 'casual' | 'romantic';
}): Promise<string[]> {
  const { occasion, recipient, relationship, tone = 'casual' } = params;

  const prompt = `
Tạo 3 lời chúc thiệp tặng kèm hoa tiếng Việt với các thông tin sau:
- Dịp tặng: ${occasion}
- Người nhận: ${recipient}
- Mối quan hệ: ${relationship}
- Phong cách: ${tone === 'formal' ? 'trang trọng' : tone === 'romantic' ? 'lãng mạn' : 'thân mật'}

Yêu cầu:
- Mỗi lời chúc dài 3-5 câu, tổng khoảng 50-80 từ
- Phù hợp với văn hóa Việt Nam
- Chân thành, ý nghĩa, cảm động
- 3 phong cách khác nhau: 1) ngắn gọn súc tích, 2) chi tiết đầy đủ, 3) có vần điệu hoặc thơ
- Có thể thêm emoji phù hợp
- Nội dung phải khác biệt rõ rệt giữa 3 lời chúc

Trả về ĐÚNG định dạng JSON array: ["lời chúc 1", "lời chúc 2", "lời chúc 3"]
KHÔNG thêm markdown, KHÔNG thêm giải thích, CHỈ trả về JSON thuần.
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Remove markdown code blocks if present
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // Try to parse JSON array
    try {
      const messages = JSON.parse(text);
      if (Array.isArray(messages) && messages.length >= 3) {
        return messages.slice(0, 3);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
    }

    // Fallback: extract messages from text
    const lines = text.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 30 && !trimmed.startsWith('[') && !trimmed.startsWith('{');
    });

    if (lines.length >= 3) {
      return lines.slice(0, 3).map(line => line.replace(/^["']|["']$/g, '').trim());
    }

    throw new Error('Could not extract messages from AI response');
  } catch (error) {
    console.error('Generate message error:', error);
    throw new Error('Message generation failed');
  }
}

/**
 * Suggest products based on conversation
 */
export async function suggestProductsFromChat(
  userMessage: string,
  context?: string
): Promise<{
  intent: string;
  keywords: string[];
  filters: {
    occasion?: string;
    priceRange?: string;
    color?: string;
    size?: string;
  };
}> {
  const prompt = `
Analyze this customer message about buying flowers and extract:
1. Purchase intent (browsing, ready to buy, need help)
2. Keywords for product search
3. Filters (occasion, price range, color preferences, size)

Customer message: "${userMessage}"
${context ? `Context: ${context}` : ''}

Respond in JSON format:
{
  "intent": "browsing|buying|help",
  "keywords": ["keyword1", "keyword2"],
  "filters": {
    "occasion": "birthday|anniversary|...",
    "priceRange": "budget|medium|premium",
    "color": "red|white|mixed|...",
    "size": "S|M|L"
  }
}
`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      return JSON.parse(text);
    } catch {
      return {
        intent: 'browsing',
        keywords: extractKeywords(userMessage),
        filters: {},
      };
    }
  } catch (error) {
    console.error('Suggest products error:', error);
    throw new Error('Product suggestion failed');
  }
}

/**
 * Extract keywords from text (fallback)
 */
function extractKeywords(text: string): string[] {
  const commonWords = ['là', 'của', 'và', 'có', 'được', 'cho', 'trong', 'với', 'the', 'a', 'an', 'is', 'are', 'this', 'that'];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.includes(word))
    .slice(0, 10);
}

export default genAI;
