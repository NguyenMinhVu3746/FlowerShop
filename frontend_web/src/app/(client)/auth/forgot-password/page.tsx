'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/auth';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      await authApi.forgotPassword(data.email);
      setEmailSent(true);
      toast.success('Email đặt lại mật khẩu đã được gửi!');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Có lỗi xảy ra, vui lòng thử lại sau'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md py-16 px-4">
      {/* Back Button */}
      <Link
        href="/auth/login"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại đăng nhập
      </Link>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Quên mật khẩu?</h1>
        <p className="text-muted-foreground">
          Nhập email của bạn để nhận link đặt lại mật khẩu
        </p>
      </div>

      {/* Form or Success Message */}
      <div className="bg-card border rounded-lg p-6 shadow-sm">
        {emailSent ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến{' '}
                <strong>{form.getValues('email')}</strong>.
                <br />
                <br />
                Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn. Nếu
                không thấy email, hãy kiểm tra mục Spam.
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setEmailSent(false)}
            >
              Gửi lại email
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@gmail.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi email...
                  </>
                ) : (
                  'Gửi email đặt lại mật khẩu'
                )}
              </Button>
            </form>
          </Form>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Bạn nhớ lại mật khẩu?{' '}
          <Link
            href="/auth/login"
            className="text-primary font-medium hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
