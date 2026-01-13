/**
 * AI SCAN PAGE
 * =============
 * Flower detection using YOLO model - scan image to detect and count flowers
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { Header, Footer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Camera, Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { aiApi } from '@/lib/api/ai';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

// Flower price list (matching Flutter app)
const FLOWER_PRICE_LIST: Record<string, { name: string; price: number }> = {
  'Hoa cuc hoa mi': { name: 'Cúc Họa Mi', price: 5000 },
  'Hoa huong duong': { name: 'Hoa Hướng Dương', price: 30000 },
  'Hoa hong': { name: 'Hoa Hồng', price: 11000 },
  'Hoa ly': { name: 'Hoa Ly', price: 35000 },
  'Hoa tulip': { name: 'Hoa Tulip', price: 45000 },
  'Hoa dong tien': { name: 'Hoa Đồng Tiền', price: 30000 },
};

interface FlowerDetection {
  key: string;
  displayName: string;
  count: number;
  price: number;
  total: number;
}

export default function AIScanPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detections, setDetections] = useState<FlowerDetection[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate total price
  const totalPrice = detections.reduce((sum, item) => sum + item.total, 0);

  // Handle image selection
  const handleImageSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setImageFile(file);
      setDetections([]); // Reset detections
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  // Handle paste from clipboard
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageSelect(file);
            toast.success('Đã dán ảnh từ clipboard');
          }
          break;
        }
      }
    },
    [handleImageSelect]
  );

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleImageSelect(file);
      }
    },
    [handleImageSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Scan image
  const handleScan = async () => {
    if (!imageFile) {
      toast.error('Vui lòng chọn ảnh');
      return;
    }

    setIsLoading(true);
    try {
      const response = await aiApi.scanFlower(imageFile);

      if (response.success && response.data) {
        const detectedData: Record<string, number> = response.data;
        
        // Convert to FlowerDetection array
        const results: FlowerDetection[] = Object.entries(detectedData)
          .map(([key, count]) => {
            const flowerInfo = FLOWER_PRICE_LIST[key];
            if (!flowerInfo) return null;

            return {
              key,
              displayName: flowerInfo.name,
              count,
              price: flowerInfo.price,
              total: flowerInfo.price * count,
            };
          })
          .filter((item): item is FlowerDetection => item !== null);

        if (results.length === 0) {
          toast.info('Không tìm thấy hoa nào trong ảnh');
        } else {
          toast.success(`Đã phát hiện ${results.length} loại hoa`);
        }

        setDetections(results);
      } else {
        toast.error(response.error || 'Không thể phân tích ảnh');
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Lỗi kết nối đến AI Server. Vui lòng kiểm tra cấu hình.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear image
  const handleClear = () => {
    setSelectedImage(null);
    setImageFile(null);
    setDetections([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50" onPaste={handlePaste}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              AI Nhận Diện Hoa
            </h1>
            <p className="text-gray-600">
              Tải ảnh lên để AI phát hiện và đếm số lượng hoa
            </p>
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left: Image Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Tải ảnh lên
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedImage ? (
                    <div
                      className="flex min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-primary hover:bg-gray-100"
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      <ImageIcon className="mb-4 h-16 w-16 text-gray-400" />
                      <p className="mb-2 text-lg font-semibold text-gray-700">
                        Chọn hoặc kéo ảnh vào đây
                      </p>
                      <p className="mb-4 text-sm text-gray-500">
                        Hỗ trợ: JPG, PNG, JPEG (tối đa 10MB)
                      </p>
                      <p className="text-xs text-gray-400">
                        Hoặc dán ảnh từ clipboard (Ctrl+V)
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                        <Image
                          src={selectedImage}
                          alt="Selected"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={handleClear}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />

                  <div className="mt-4 space-y-2">
                    {!selectedImage ? (
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Chọn ảnh từ máy
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={handleScan}
                          className="w-full"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Đang phân tích...
                            </>
                          ) : (
                            <>
                              <Camera className="mr-2 h-4 w-4" />
                              Quét ảnh
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleClear}
                          variant="outline"
                          className="w-full"
                        >
                          Chọn ảnh khác
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Right: Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Kết quả phát hiện</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : detections.length === 0 ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                      <ImageIcon className="mb-4 h-16 w-16 text-gray-300" />
                      <p className="text-gray-500">
                        Chưa có kết quả. Vui lòng chọn ảnh và quét.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Detections List */}
                      <div className="space-y-3">
                        {detections.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
                          >
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {item.displayName}
                              </h3>
                              <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                                <Badge variant="secondary">
                                  {item.count} bông
                                </Badge>
                                <span>×</span>
                                <span>{formatPrice(item.price)}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">
                                {formatPrice(item.total)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-semibold text-gray-900">
                            Tổng giá trị ước tính:
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            {formatPrice(totalPrice)}
                          </p>
                        </div>
                        <p className="mt-2 text-xs text-gray-600">
                          * Giá chỉ mang tính chất tham khảo
                        </p>
                      </div>

                      {/* Info */}
                      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
                        <p className="font-semibold">💡 Lưu ý:</p>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-blue-800">
                          <li>Kết quả phụ thuộc vào chất lượng ảnh</li>
                          <li>Ảnh rõ nét, góc chụp thẳng sẽ cho kết quả tốt hơn</li>
                          <li>Giá trị chỉ mang tính chất tham khảo</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
