import { NextRequest } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkoutSchema } from '@/lib/validations/order';
import { successResponse, errorResponse, handleApiError } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticate(request);

    if (!authResult.authenticated) {
      return authResult.response;
    }

    const body = await request.json();
    
    console.log('🛒 Checkout body:', JSON.stringify(body, null, 2));
    console.log('🛒 Receiver type:', typeof body.receiver);
    console.log('🛒 Phone type:', typeof body.receiver?.phone);
    console.log('🛒 VoucherCode type:', typeof body.voucherCode);
    
    const validatedData = checkoutSchema.parse(body);

    // Validate all variants exist and calculate total
    let subtotal = 0;
    const itemsData: any[] = [];

    for (const item of validatedData.items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: {
          product: true,
        },
      });

      if (!variant || !variant.isActive || !variant.product.isActive) {
        return errorResponse(`Sản phẩm không tồn tại hoặc không khả dụng`, 400);
      }

      if (variant.stock < item.quantity) {
        return errorResponse(
          `Sản phẩm "${variant.product.title}" (Size ${variant.size}) chỉ còn ${variant.stock} sản phẩm`,
          400
        );
      }

      const itemTotal = Number(variant.price) * item.quantity;
      subtotal += itemTotal;

      itemsData.push({
        variantId: variant.id,
        quantity: item.quantity,
        price: variant.price,
        addons: item.addons || null,
      });
    }

    // Apply voucher if provided
    let discount = 0;
    let voucherUsed = null;

    if (validatedData.voucherCode) {
      const voucher = await prisma.voucher.findUnique({
        where: { code: validatedData.voucherCode },
      });

      if (!voucher) {
        return errorResponse('Mã voucher không tồn tại', 400);
      }

      const now = new Date();
      if (
        !voucher.isActive ||
        now < voucher.startDate ||
        now > voucher.endDate ||
        voucher.used >= voucher.quantity
      ) {
        return errorResponse('Mã voucher không hợp lệ hoặc đã hết hạn', 400);
      }

      if (voucher.minOrder && subtotal < Number(voucher.minOrder)) {
        return errorResponse(
          `Đơn hàng tối thiểu ${voucher.minOrder}đ để sử dụng voucher này`,
          400
        );
      }

      // Calculate discount
      if (voucher.type === 'PERCENTAGE') {
        discount = (subtotal * Number(voucher.value)) / 100;
        if (voucher.maxDiscount && discount > Number(voucher.maxDiscount)) {
          discount = Number(voucher.maxDiscount);
        }
      } else {
        discount = Number(voucher.value);
      }

      voucherUsed = voucher;
    }

    const total = subtotal - discount;

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx: any) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: authResult.user!.userId,
          total,
          note: validatedData.note,
          messageCard: validatedData.messageCard,
          senderType: validatedData.senderType || 'NAMED',
          status: 'PENDING',
        },
      });

      // Create order receiver
      await tx.orderReceiver.create({
        data: {
          orderId: newOrder.id,
          name: validatedData.receiver.name,
          phone: validatedData.receiver.phone,
          address: validatedData.receiver.address,
          deliveryDate: new Date(validatedData.receiver.deliveryDate),
          deliverySlot: validatedData.receiver.deliverySlot,
        },
      });

      // Create order items and update stock
      for (const itemData of itemsData) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            ...itemData,
          },
        });

        // Decrease variant stock
        await tx.productVariant.update({
          where: { id: itemData.variantId },
          data: {
            stock: {
              decrement: itemData.quantity,
            },
          },
        });
      }

      // Create payment
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          method: validatedData.paymentMethod,
          amount: total,
          status: validatedData.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
        },
      });

      // Update voucher usage
      if (voucherUsed) {
        await tx.voucher.update({
          where: { id: voucherUsed.id },
          data: {
            used: {
              increment: 1,
            },
          },
        });
      }

      return newOrder;
    });

    // Fetch complete order data
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        receiver: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
        payment: true,
      },
    });

    return successResponse(
      {
        order: completeOrder,
        discount,
        subtotal,
      },
      'Đặt hàng thành công',
      201
    );
  } catch (error: any) {
    if (error.name === 'ZodError' && error.errors?.length > 0) {
      return errorResponse(error.errors[0].message, 400);
    }
    return handleApiError(error);
  }
}
