import { NextRequest } from 'next/server';
import { z } from 'zod';
import { errorResponse, successResponse } from '@/lib/response';
import { generateGreetingMessage } from '@/lib/gemini';

// Validation schema
const suggestMessageSchema = z.object({
  occasion: z.string().min(1, 'Vui lòng chọn dịp tặng hoa'),
  recipient: z.string().min(1, 'Vui lòng nhập tên người nhận'),
  relationship: z.string().min(1, 'Vui lòng chọn mối quan hệ'),
  tone: z.enum(['formal', 'casual', 'romantic']).optional().default('casual'),
});

/**
 * POST /api/checkout/ai-suggest-message
 * AI gợi ý lời chúc thiệp tặng kèm
 * Body: { 
 *   occasion: string,
 *   recipient: string, 
 *   relationship: string,
 *   tone?: 'formal' | 'casual' | 'romantic'
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const params = suggestMessageSchema.parse(body);

    // Generate messages with AI
    const messages = await generateGreetingMessage(params);

    // Ensure we have at least 3 messages
    const finalMessages = messages.length >= 3 
      ? messages.slice(0, 3)
      : [
          ...messages,
          ...getDefaultMessages(params.occasion, params.tone).slice(messages.length),
        ];

    return successResponse({
      suggestions: finalMessages,
      params: {
        occasion: params.occasion,
        recipient: params.recipient,
        relationship: params.relationship,
        tone: params.tone,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }
    console.error('AI suggest message error:', error);
    
    // Fallback to default messages
    try {
      const body = await req.json();
      const defaultMessages = getDefaultMessages(
        body.occasion || 'sinh nhật',
        body.tone || 'casual'
      );
      
      return successResponse({
        suggestions: defaultMessages,
        params: body,
      });
    } catch {
      return errorResponse('Không thể tạo lời chúc. Vui lòng thử lại', 500);
    }
  }
}

/**
 * Default messages as fallback
 */
function getDefaultMessages(occasion: string, tone: string = 'casual'): string[] {
  const messages: Record<string, Record<string, string[]>> = {
    'birthday': {
      casual: [
        'Chúc mừng sinh nhật! 🎂 Chúc bạn luôn tràn đầy niềm vui, hạnh phúc và thành công trong cuộc sống. Mong rằng tuổi mới sẽ mang đến cho bạn nhiều điều tốt đẹp, những trải nghiệm thú vị và những kỷ niệm đáng nhớ bên người thân yêu.',
        'Happy Birthday! 🎉 Mong rằng tuổi mới này sẽ là một chặng đường tuyệt vời với vô vàn niềm vui và thành công. Chúc bạn luôn khỏe mạnh, hạnh phúc, và đạt được tất cả những ước mơ mà mình hằng mong đợi. Chúc một ngày sinh nhật thật ý nghĩa!',
        'Sinh nhật vui vẻ! 🌸 Chúc bạn mãi xinh đẹp, tươi trẻ như đóa hoa này. Tuổi mới chúc bạn nhiều sức khỏe, thành công rực rỡ trong công việc và tình yêu thương tràn ngập trong cuộc sống. Mong những điều tốt đẹp nhất sẽ luôn đến với bạn!',
      ],
      formal: [
        'Kính chúc Quý Anh/Chị sinh nhật vui vẻ, sức khỏe dồi dào và thành công rực rỡ. Mong rằng tuổi mới sẽ mang đến cho Anh/Chị nhiều niềm vui, hạnh phúc và những thành tựu to lớn trong công việc cũng như cuộc sống. Trân trọng gửi lời chúc tốt đẹp nhất.',
        'Nhân dịp sinh nhật, xin gửi đến Quý Anh/Chị lời chúc tốt đẹp nhất. Chúc Anh/Chị luôn dồi dào sức khỏe, thành đạt trong sự nghiệp và hạnh phúc bên gia đình. Mong rằng mọi điều may mắn và thuận lợi sẽ luôn đồng hành cùng Anh/Chị.',
        'Chúc mừng sinh nhật! Kính chúc Quý Anh/Chị luôn hạnh phúc, an khang và phát triển trong sự nghiệp. Tuổi mới chúc Anh/Chị gặt hái được nhiều thành công, có thật nhiều niềm vui và được tận hưởng cuộc sống trọn vẹn nhất. Trân trọng.',
      ],
      romantic: [
        'Sinh nhật vui vẻ người yêu của anh! ❤️ Cảm ơn em đã luôn ở bên, làm cuộc đời anh thêm ý nghĩa. Anh yêu em rất nhiều và mong rằng tuổi mới này, em sẽ luôn hạnh phúc, xinh đẹp và đạt được tất cả những gì em mong muốn. Anh sẽ mãi ở bên cạnh em!',
        'Happy Birthday my love! 💕 Chúc em tuổi mới tràn đầy hạnh phúc, xinh đẹp mãi không già. Em là món quà quý giá nhất cuộc đời anh, và anh hứa sẽ luôn yêu thương, chăm sóc em hết mình. Mong em luôn mỉm cười và hạnh phúc bên anh!',
        'Sinh nhật em, anh muốn nói: Em là món quà quý giá nhất cuộc đời anh. 🌹 Cảm ơn em đã làm cuộc sống của anh thêm màu sắc. Chúc em sinh nhật thật nhiều niềm vui, luôn khỏe mạnh và xinh đẹp. Anh yêu em hơn bất cứ điều gì trên đời!',
      ],
    },
    'anniversary': {
      casual: [
        'Chúc mừng kỷ niệm! 💑 Chúc hai bạn luôn hạnh phúc, yêu thương và đồng hành cùng nhau. Mong rằng tình yêu của hai người sẽ mãi mãi bền chặt, vượt qua mọi thử thách và cùng nhau xây dựng một tương lai tươi sáng. Chúc hai bạn có thật nhiều kỷ niệm đẹp!',
        'Happy Anniversary! 💕 Mong rằng tình yêu của hai bạn mãi vững bền như ngày đầu tiên. Chúc hai người luôn hạnh phúc, thấu hiểu và yêu thương nhau từng ngày. Kỷ niệm này là dấu mốc cho một chặng đường tuyệt vời, và còn nhiều năm hạnh phúc nữa phía trước!',
        'Kỷ niệm vui vẻ! 🌹 Chúc hai người luôn là chỗ dựa vững chắc của nhau, cùng nhau vượt qua mọi khó khăn và chia sẻ niềm vui. Tình yêu của hai bạn là nguồn cảm hứng tuyệt vời. Chúc mãi hạnh phúc bên nhau!',
      ],
      formal: [
        'Kính chúc mừng kỷ niệm ngày cưới! Chúc Quý Vợ Chồng luôn hạnh phúc, hòa thuận và thành đạt. Mong rằng tình yêu và sự thấu hiểu của hai bạn sẽ mãi bền chặt, cùng nhau xây dựng gia đình ấm êm và hạnh phúc. Trân trọng gửi lời chúc tốt đẹp nhất.',
        'Nhân dịp kỷ niệm, xin gửi lời chúc tốt đẹp nhất đến Quý Vợ Chồng. Chúc gia đình luôn ấm êm, tràn ngập tiếng cười và hạnh phúc. Mong rằng hai bạn sẽ luôn là điểm tựa vững chắc cho nhau, cùng nhau vượt qua mọi thăng trầm của cuộc sống.',
        'Chúc mừng kỷ niệm! Chúc hai bạn mãi yêu thương, chia sẻ và cùng nhau vượt qua mọi khó khăn. Tình yêu của Quý Vợ Chồng là tấm gương sáng cho mọi người. Chúc gia đình luôn hạnh phúc, sức khỏe dồi dào và thành công trong mọi lĩnh vực.',
      ],
      romantic: [
        'Happy Anniversary! ❤️ Mỗi ngày bên em đều là một kỷ niệm đẹp với anh. Cảm ơn em đã làm cuộc đời anh trọn vẹn. Anh yêu em mãi mãi, và mong rằng chúng ta sẽ có thêm vô vàn những kỷ niệm tuyệt vời bên nhau. Forever and always!',
        'Kỷ niệm ngày ta bên nhau. Cảm ơn em đã làm cuộc đời anh thêm ý nghĩa. 💕 Mỗi khoảnh khắc bên em đều quý giá với anh. Anh hứa sẽ luôn yêu thương, trân trọng và bảo vệ em. Chúc ta mãi hạnh phúc và yêu nhau như ngày đầu tiên. Love you!',
        'Em à, cảm ơn em đã cho anh những kỷ niệm tuyệt vời nhất. 🌹 Em là lý do anh mỉm cười mỗi ngày, là động lực để anh cố gắng. Chúc ta mãi hạnh phúc, luôn bên nhau dù có bất cứ chuyện gì xảy ra. Anh yêu em đến tận cùng!',
      ],
    },
    'thanks': {
      casual: [
        'Cảm ơn bạn rất nhiều! 🙏 Sự giúp đỡ của bạn thật ý nghĩa với tôi. Tôi không biết phải nói gì hơn ngoài lời cảm ơn từ đáy lòng. Mong rằng bạn luôn gặp nhiều điều tốt lành trong cuộc sống, và tôi sẽ luôn nhớ đến sự tốt bụng của bạn.',
        'Thank you so much! 💐 Tôi thật sự biết ơn vì những gì bạn đã làm cho tôi. Bạn đã giúp tôi rất nhiều trong lúc khó khăn. Chúc bạn luôn khỏe mạnh, hạnh phúc và thành công. Một lần nữa, xin chân thành cảm ơn!',
        'Xin chân thành cảm ơn! 🌸 Bạn thật tuyệt vời và tôi rất may mắn khi có bạn bên cạnh. Sự quan tâm và giúp đỡ của bạn đã mang lại cho tôi rất nhiều động lực. Chúc bạn luôn gặp nhiều điều may mắn và hạnh phúc!',
      ],
      formal: [
        'Kính gửi lời cảm ơn chân thành nhất đến Quý Anh/Chị. Sự hỗ trợ của Anh/Chị thật quý giá và ý nghĩa. Tôi không thể diễn tả hết lòng biết ơn của mình. Chúc Anh/Chị luôn dồi dào sức khỏe, thành công trong công việc và hạnh phúc bên gia đình.',
        'Xin bày tỏ lòng biết ơn sâu sắc đến Quý Anh/Chị vì sự giúp đỡ tận tình. Anh/Chị đã giúp tôi vượt qua khó khăn và tôi vô cùng trân trọng điều đó. Chúc Anh/Chị luôn gặt hái nhiều thành công và có những ngày tháng tốt đẹp. Trân trọng cảm ơn.',
        'Chân thành cảm ơn Quý Anh/Chị. Sự quan tâm và hỗ trợ của Anh/Chị thật đáng quý. Chúc Anh/Chị sức khỏe, hạnh phúc và thành công trong mọi lĩnh vực. Một lần nữa, xin gửi lời tri ân sâu sắc nhất đến Quý Anh/Chị.',
      ],
      romantic: [
        'Cảm ơn em đã luôn ở bên anh. Em là điều tuyệt vời nhất đời anh! ❤️ Anh không biết mình sẽ làm gì nếu không có em. Em là nguồn động lực, là lý do để anh cố gắng mỗi ngày. Anh yêu em nhiều lắm và sẽ luôn trân trọng em!',
        'Thank you for being you! 💕 Anh yêu em rất nhiều và biết ơn vì mọi thứ em đã làm. Em làm cuộc sống của anh thêm ý nghĩa, mỗi ngày bên em đều là một món quà. Cảm ơn em vì đã chọn anh. Love you forever!',
        'Cảm ơn em vì tất cả. Em làm cuộc sống của anh thêm ý nghĩa. 🌹 Từ những điều nhỏ nhặt đến những khoảnh khắc quan trọng, em luôn ở bên anh. Anh vô cùng trân trọng và yêu thương em. Cảm ơn em đã là chính mình!',
      ],
    },
  };

  const occasionKey = occasion.toLowerCase();
  const toneKey = tone.toLowerCase();

  if (messages[occasionKey] && messages[occasionKey][toneKey]) {
    return messages[occasionKey][toneKey];
  }

  // Default fallback
  return [
    'Gửi bạn những lời chúc tốt đẹp nhất! 🌸 Mong rằng những bông hoa này sẽ làm bạn mỉm cười và mang đến niềm vui. Chúc bạn luôn khỏe mạnh, hạnh phúc và gặp nhiều may mắn trong cuộc sống. Trân trọng!',
    'Chúc bạn luôn vui vẻ, hạnh phúc và thành công! 💐 Hy vọng những bông hoa này sẽ làm ngày của bạn thêm rực rỡ. Mong rằng mọi điều tốt đẹp sẽ đến với bạn và gia đình. Giữ gìn sức khỏe và luôn giữ nụ cười nhé!',
    'Mong rằng những bông hoa này sẽ làm bạn mỉm cười! 🌹 Dù là dịp gì đi nữa, tôi muốn gửi đến bạn những lời chúc tốt đẹp nhất. Chúc bạn luôn tràn đầy năng lượng, hạnh phúc và thành công trong mọi việc. Cảm ơn bạn!',
  ];
}
