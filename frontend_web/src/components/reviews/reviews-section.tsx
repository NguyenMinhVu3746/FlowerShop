/**
 * REVIEWS SECTION COMPONENT
 * =========================
 * Display reviews list + create review form
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productApi } from '@/lib/api';
import { useAuth } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Chọn số sao').max(5),
  comment: z.string().min(10, 'Nhận xét phải có ít nhất 10 ký tự'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewsSectionProps {
  productId: number | string;
  slug: string;
}

export function ReviewsSection({ productId, slug }: ReviewsSectionProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch reviews
  const { data, isLoading } = useQuery({
    queryKey: ['product-reviews', slug, page],
    queryFn: async () => {
      const response = await productApi.getProductReviews(slug, { page, limit: 10 });
      return response.data;
    },
  });

  const reviews = data?.reviews || [];
  const totalReviews = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: '',
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const response = await productApi.createReview(slug, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Đánh giá của bạn đã được gửi');
      queryClient.invalidateQueries({ queryKey: ['product-reviews', slug] });
      queryClient.invalidateQueries({ queryKey: ['product', slug] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.error || 'Không thể gửi đánh giá. Vui lòng thử lại';
      toast.error(message);
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }
    createReviewMutation.mutate(data);
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onChange?.(star) : undefined}
            className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : ''}
            disabled={!interactive}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Write Review Button */}
      {isAuthenticated && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Viết đánh giá</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Đánh giá sản phẩm</DialogTitle>
              <DialogDescription>
                Chia sẻ trải nghiệm của bạn về sản phẩm này
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Rating */}
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đánh giá</FormLabel>
                      <FormControl>
                        {renderStars(field.value, true, field.onChange)}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Comment */}
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhận xét</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" disabled={createReviewMutation.isPending}>
                    {createReviewMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 w-1/4 rounded bg-gray-200" />
                  <div className="h-3 w-full rounded bg-gray-200" />
                  <div className="h-3 w-3/4 rounded bg-gray-200" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">Chưa có đánh giá nào</p>
            {isAuthenticated && (
              <p className="mt-2 text-sm text-gray-500">
                Hãy là người đầu tiên đánh giá sản phẩm này
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{review.user.fullname}</p>
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{review.comment}</p>

                  {/* Admin Reply */}
                  {review.reply && (
                    <div className="mt-4 rounded-lg bg-blue-50 p-4">
                      <p className="mb-1 text-sm font-semibold text-blue-900">
                        Phản hồi từ shop:
                      </p>
                      <p className="text-sm text-blue-800">{review.reply}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Trang {page} / {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
