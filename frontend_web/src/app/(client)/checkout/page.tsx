/**
 * CHECKOUT PAGE
 * =============
 * Complete checkout flow with receiver info, delivery, payment, voucher
 */

'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart, useAuth } from '@/lib/hooks';
import { checkoutApi, userApi, productApi } from '@/lib/api';
import { getImageUrl, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Loader2, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { PaymentMethod, SenderType, Address } from '@/types';

// Validation schema
const checkoutSchema = z.object({
  // Receiver info
  receiverName: z.string().min(1, 'Vui lòng nhập tên người nhận'),
  receiverPhone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 số'),
  receiverAddress: z.string().min(5, 'Vui lòng nhập địa chỉ'),
  deliveryDate: z.string().min(1, 'Vui lòng chọn ngày giao'),
  deliverySlot: z.string().min(1, 'Vui lòng chọn khung giờ'),
  
  // Payment
  paymentMethod: z.enum(['COD', 'BANK_TRANSFER', 'MOMO', 'VNPAY']),
  
  // Optional
  voucherCode: z.string().optional(),
  note: z.string().optional(),
  messageCard: z.string().optional(),
  senderType: z.enum(['NAMED', 'ANONYMOUS']),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const deliverySlots = [
  { value: '08:00-10:00', label: '8:00 - 10:00' },
  { value: '10:00-12:00', label: '10:00 - 12:00' },
  { value: '14:00-16:00', label: '14:00 - 16:00' },
  { value: '16:00-18:00', label: '16:00 - 18:00' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [aiMessages, setAiMessages] = useState<string[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showAIForm, setShowAIForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [aiParams, setAiParams] = useState({
    occasion: 'birthday',
    recipient: '',
    relationship: 'family',
    tone: 'casual' as 'formal' | 'casual' | 'romantic',
  });

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      receiverName: '',
      receiverPhone: '',
      receiverAddress: '',
      deliveryDate: '',
      deliverySlot: '',
      paymentMethod: 'COD',
      voucherCode: '',
      note: '',
      messageCard: '',
      senderType: 'NAMED',
    },
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (!items || items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để tiếp tục');
      router.push('/auth/login?redirect=/checkout');
    }
  }, [isAuthenticated, router]);

  // Fetch user addresses
  const { data: addressesData, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await userApi.getAddresses();
      return response.data?.addresses || [];
    },
    enabled: isAuthenticated,
  });

  // Redirect to create address if no address exists
  useEffect(() => {
    if (isAuthenticated && addressesData !== undefined && addressesData.length === 0) {
      toast.error('Vui lòng thêm địa chỉ giao hàng trước');
      router.push('/profile/addresses');
    }
  }, [isAuthenticated, addressesData, router]);

  // Auto-fill default address
  useEffect(() => {
    if (addressesData && addressesData.length > 0 && !selectedAddressId) {
      const defaultAddress = addressesData.find((addr) => addr.isDefault) || addressesData[0];
      setSelectedAddressId(defaultAddress.id);
      form.setValue('receiverName', defaultAddress.nameReceiver);
      form.setValue('receiverPhone', defaultAddress.phoneReceiver);
      form.setValue('receiverAddress', defaultAddress.fullAddress);
    }
  }, [addressesData, form, selectedAddressId]);

  // Validate voucher
  const handleValidateVoucher = async () => {
    const code = form.getValues('voucherCode');
    if (!code) return;

    setIsValidatingVoucher(true);
    try {
      const response = await productApi.validateVoucher(code, totalPrice);
      if (response.success && response.data) {
        setVoucherDiscount(response.data.discount);
        toast.success(`Áp dụng mã giảm ${formatPrice(response.data.discount)}đ`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setVoucherDiscount(0);
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  // AI suggest message
  const handleAISuggest = async () => {
    if (!aiParams.recipient.trim()) {
      toast.error('Vui lòng nhập tên người nhận');
      return;
    }

    setIsLoadingAI(true);
    try {
      const response = await checkoutApi.aiSuggestMessage(aiParams);
      
      if (response.success && response.data) {
        setAiMessages(response.data.suggestions || response.data.messages || []);
        setShowAIForm(false);
      }
    } catch (error) {
      toast.error('Không thể tải gợi ý AI');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const response = await checkoutApi.checkout({
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        receiver: {
          name: data.receiverName,
          phone: data.receiverPhone,
          address: data.receiverAddress,
          deliveryDate: data.deliveryDate,
          deliverySlot: data.deliverySlot,
        },
        paymentMethod: data.paymentMethod as PaymentMethod,
        voucherCode: data.voucherCode,
        note: data.note,
        messageCard: data.messageCard,
        senderType: data.senderType as SenderType,
      });
      return response;
    },
    onSuccess: (response) => {
      // Backend returns { success: true, data: {...}, message: '...' }
      if (response?.data) {
        clearCart();
        toast.success(response.message || 'Đặt hàng thành công!');
        // Redirect to orders page
        setTimeout(() => {
          router.push('/profile/orders');
        }, 500);
      } else {
        toast.error('Đặt hàng thành công nhưng không nhận được thông tin đơn hàng');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Đặt hàng thất bại');
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    checkoutMutation.mutate(data);
  };

  const shippingFee = totalPrice >= 500000 ? 0 : 30000;
  const finalTotal = totalPrice + shippingFee - voucherDiscount;

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">Thanh toán</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Forms */}
            <div className="space-y-6 lg:col-span-2">
              {/* Receiver Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin người nhận</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Address selector */}
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <Label className="text-base font-semibold">📍 Chọn địa chỉ giao hàng</Label>
                    <p className="mb-2 text-sm text-gray-600">
                      Chọn một trong các địa chỉ đã lưu của bạn
                    </p>
                    <Select
                      value={selectedAddressId}
                      onValueChange={(value) => {
                        setSelectedAddressId(value);
                        const addr = addressesData?.find((a) => a.id === value);
                        if (addr) {
                          form.setValue('receiverName', addr.nameReceiver);
                          form.setValue('receiverPhone', addr.phoneReceiver);
                          form.setValue('receiverAddress', addr.fullAddress);
                        }
                      }}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="-- Chọn địa chỉ giao hàng --" />
                      </SelectTrigger>
                      <SelectContent>
                        {addressesData?.map((addr) => (
                          <SelectItem key={addr.id} value={addr.id}>
                            <div className="flex flex-col">
                              <span className="font-semibold">
                                {addr.title} - {addr.nameReceiver}
                                {addr.isDefault && ' ⭐'}
                              </span>
                              <span className="text-xs text-gray-500">{addr.fullAddress}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Display selected address info (readonly) */}
                  {selectedAddressId && (
                    <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
                      <div>
                        <Label className="text-sm text-gray-600">Người nhận</Label>
                        <p className="font-semibold">{form.watch('receiverName')}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Số điện thoại</Label>
                        <p className="font-semibold">{form.watch('receiverPhone')}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Địa chỉ giao hàng</Label>
                        <p className="font-semibold">{form.watch('receiverAddress')}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="deliveryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ngày giao hàng *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} min={new Date().toISOString().split('T')[0]} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deliverySlot"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Khung giờ giao *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn giờ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {deliverySlots.map((slot) => (
                                <SelectItem key={slot.value} value={slot.value}>
                                  {slot.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Message Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Thiệp chúc mừng</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAIForm(!showAIForm)}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI gợi ý
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* AI Form */}
                  {showAIForm && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="space-y-3 p-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <Label>Dịp tặng hoa</Label>
                            <Select
                              value={aiParams.occasion}
                              onValueChange={(value) => setAiParams({ ...aiParams, occasion: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="birthday">Sinh nhật</SelectItem>
                                <SelectItem value="anniversary">Kỷ niệm</SelectItem>
                                <SelectItem value="thanks">Cảm ơn</SelectItem>
                                <SelectItem value="apology">Xin lỗi</SelectItem>
                                <SelectItem value="congratulation">Chúc mừng</SelectItem>
                                <SelectItem value="getwell">Chúc mau khỏe</SelectItem>
                                <SelectItem value="love">Tình yêu</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Người nhận *</Label>
                            <Input
                              placeholder="VD: Mẹ, Bạn gái, Sếp..."
                              value={aiParams.recipient}
                              onChange={(e) => setAiParams({ ...aiParams, recipient: e.target.value })}
                            />
                          </div>

                          <div>
                            <Label>Mối quan hệ</Label>
                            <Select
                              value={aiParams.relationship}
                              onValueChange={(value) => setAiParams({ ...aiParams, relationship: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="family">Gia đình</SelectItem>
                                <SelectItem value="friend">Bạn bè</SelectItem>
                                <SelectItem value="lover">Người yêu</SelectItem>
                                <SelectItem value="colleague">Đồng nghiệp</SelectItem>
                                <SelectItem value="boss">Cấp trên</SelectItem>
                                <SelectItem value="customer">Khách hàng</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Phong cách</Label>
                            <Select
                              value={aiParams.tone}
                              onValueChange={(value) => setAiParams({ ...aiParams, tone: value as any })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="casual">Thân mật</SelectItem>
                                <SelectItem value="formal">Trang trọng</SelectItem>
                                <SelectItem value="romantic">Lãng mạn</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Button
                          type="button"
                          className="w-full"
                          onClick={handleAISuggest}
                          disabled={isLoadingAI}
                        >
                          {isLoadingAI ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Đang tạo lời chúc...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Tạo lời chúc
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {aiMessages.length > 0 && (
                    <div className="space-y-2">
                      <Label>Chọn lời chúc AI gợi ý:</Label>
                      {aiMessages.map((msg, idx) => (
                        <Card
                          key={idx}
                          className="cursor-pointer transition-colors hover:bg-gray-50"
                          onClick={() => form.setValue('messageCard', msg)}
                        >
                          <CardContent className="p-3 text-sm">{msg}</CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="messageCard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lời nhắn trên thiệp</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Viết lời chúc của bạn..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="senderType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Người gửi</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="NAMED" id="named" />
                              <Label htmlFor="named" className="cursor-pointer">
                                Ghi tên ({user?.fullname})
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="ANONYMOUS" id="anonymous" />
                              <Label htmlFor="anonymous" className="cursor-pointer">
                                Ẩn danh
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ghi chú cho shop</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Ghi chú đặc biệt..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Phương thức thanh toán</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="space-y-3"
                          >
                            <div className="flex items-center space-x-2 rounded border p-3">
                              <RadioGroupItem value="COD" id="cod" />
                              <Label htmlFor="cod" className="flex-1 cursor-pointer">
                                <span className="font-semibold">COD</span>
                                <p className="text-sm text-gray-600">Thanh toán khi nhận hàng</p>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 rounded border p-3">
                              <RadioGroupItem value="BANK_TRANSFER" id="bank" />
                              <Label htmlFor="bank" className="flex-1 cursor-pointer">
                                <span className="font-semibold">Chuyển khoản</span>
                                <p className="text-sm text-gray-600">Chuyển khoản ngân hàng</p>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 rounded border p-3 opacity-50">
                              <RadioGroupItem value="MOMO" id="momo" disabled />
                              <Label htmlFor="momo" className="flex-1">
                                <span className="font-semibold">Momo</span>
                                <p className="text-sm text-gray-600">Đang phát triển</p>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 rounded border p-3 opacity-50">
                              <RadioGroupItem value="VNPAY" id="vnpay" disabled />
                              <Label htmlFor="vnpay" className="flex-1">
                                <span className="font-semibold">VNPay</span>
                                <p className="text-sm text-gray-600">Đang phát triển</p>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Đơn hàng ({items.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="max-h-60 space-y-3 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.variantId} className="flex gap-3">
                        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                          <Image 
                            src={getImageUrl(item.image)} 
                            alt={item.title} 
                            fill 
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold line-clamp-1">{item.title}</p>
                          <p className="text-xs text-gray-600">
                            Size {item.size} x {item.quantity}
                          </p>
                          <p className="text-sm font-semibold text-primary">
                            {formatPrice(item.price * item.quantity)}đ
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Voucher */}
                  <div className="space-y-2">
                    <Label>Mã giảm giá</Label>
                    <div className="flex gap-2">
                      <FormField
                        control={form.control}
                        name="voucherCode"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input placeholder="Nhập mã..." {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleValidateVoucher}
                        disabled={isValidatingVoucher}
                      >
                        {isValidatingVoucher ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : voucherDiscount > 0 ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          'Áp dụng'
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tạm tính</span>
                      <span>{formatPrice(totalPrice)}đ</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Phí giao hàng</span>
                      <span>{shippingFee > 0 ? `${formatPrice(shippingFee)}đ` : 'Miễn phí'}</span>
                    </div>
                    {voucherDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Giảm giá</span>
                        <span>-{formatPrice(voucherDiscount)}đ</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng cộng</span>
                      <span className="text-primary">{formatPrice(finalTotal)}đ</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={checkoutMutation.isPending}
                  >
                    {checkoutMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Đặt hàng'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
