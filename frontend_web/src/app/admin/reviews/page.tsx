'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Eye, EyeOff, MessageSquare, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string | null;
  images: string[];
  isHidden: boolean;
  createdAt: string;
  user?: {
    fullname: string;
    avatar: string | null;
  };
  product?: {
    title: string;
    slug: string;
  };
  adminReply?: {
    content: string;
    createdAt: string;
  } | null;
}

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [hiddenFilter, setHiddenFilter] = useState<string>('all');
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Fetch reviews
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['admin-reviews', page, hiddenFilter],
    queryFn: async () => {
      const params: any = { page, limit: 20 };
      if (hiddenFilter !== 'all') {
        params.isHidden = hiddenFilter === 'hidden';
      }
      const response = await apiClient.get('/admin/reviews', { params });
      return response.data;
    },
  });

  // Hide/unhide mutation
  const toggleHideMutation = useMutation({
    mutationFn: async ({ id, isHidden }: { id: string; isHidden: boolean }) => {
      await apiClient.patch(`/admin/review/${id}/hide`, { isHidden });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Cập nhật trạng thái thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      await apiClient.post(`/admin/review/${id}/reply`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Phản hồi thành công');
      setReplyDialogOpen(false);
      setReplyContent('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Phản hồi thất bại');
    },
  });

  const reviews = reviewsData?.data?.reviews || [];
  const pagination = reviewsData?.data?.pagination;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Đánh Giá</h1>
          <p className="text-muted-foreground">Quản lý và phản hồi đánh giá khách hàng</p>
        </div>
        <Select value={hiddenFilter} onValueChange={setHiddenFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="visible">Đang hiển thị</SelectItem>
            <SelectItem value="hidden">Đã ẩn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách Hàng</TableHead>
                <TableHead>Sản Phẩm</TableHead>
                <TableHead>Đánh Giá</TableHead>
                <TableHead>Nhận Xét</TableHead>
                <TableHead>Ngày Tạo</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead className="text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Chưa có đánh giá nào
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review: Review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.user?.avatar || undefined} />
                          <AvatarFallback>
                            {review.user?.fullname?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{review.user?.fullname}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {review.product?.title}
                    </TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="truncate">{review.comment || '-'}</div>
                      {review.images && review.images.length > 0 && (
                        <Badge variant="outline" className="mt-1">
                          {review.images.length} ảnh
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(review.createdAt), 'dd/MM/yyyy', { locale: vi })}
                    </TableCell>
                    <TableCell>
                      {review.isHidden ? (
                        <Badge variant="secondary">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Đã ẩn
                        </Badge>
                      ) : (
                        <Badge variant="default">
                          <Eye className="h-3 w-3 mr-1" />
                          Hiển thị
                        </Badge>
                      )}
                      {review.adminReply && (
                        <Badge variant="outline" className="ml-2">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Đã trả lời
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedReview(review);
                              setReplyContent(review.adminReply?.content || '');
                              setReplyDialogOpen(true);
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            {review.adminReply ? 'Sửa phản hồi' : 'Phản hồi'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              toggleHideMutation.mutate({
                                id: review.id,
                                isHidden: !review.isHidden,
                              })
                            }
                          >
                            {review.isHidden ? (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Hiển thị
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Ẩn
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Hiển thị {(page - 1) * 20 + 1} - {Math.min(page * 20, pagination.total)} của{' '}
                {pagination.total} đánh giá
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phản hồi đánh giá</DialogTitle>
            <DialogDescription>
              {selectedReview?.user?.fullname} - {selectedReview?.product?.title}
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(selectedReview.rating)}
                </div>
                <p className="text-sm">{selectedReview.comment}</p>
              </div>
              <div>
                <Textarea
                  placeholder="Nhập phản hồi của bạn..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (selectedReview && replyContent.trim()) {
                  replyMutation.mutate({ id: selectedReview.id, content: replyContent });
                }
              }}
              disabled={!replyContent.trim() || replyMutation.isPending}
            >
              {replyMutation.isPending ? 'Đang gửi...' : 'Gửi phản hồi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
