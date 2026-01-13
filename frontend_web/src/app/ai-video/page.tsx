/**
 * AI VIDEO PAGE
 * ==============
 * Real-time flower detection using camera/webcam
 * Similar to Flutter AIVideoScreen
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Header, Footer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Video, Square, Play, X, Loader2, VideoOff } from 'lucide-react';
import { toast } from 'sonner';
import { aiApi } from '@/lib/api/ai';
import { formatPrice } from '@/lib/utils';

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

export default function AIVideoPage() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detections, setDetections] = useState<FlowerDetection[]>([]);
  const [lastDetectionTime, setLastDetectionTime] = useState<Date | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate total price
  const totalPrice = detections.reduce((sum, item) => sum + item.total, 0);

  // Start camera
  const startCamera = async () => {
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Trình duyệt không hỗ trợ camera. Vui lòng sử dụng Chrome/Edge/Safari.');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Use front camera by default (easier for testing)
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      console.log('Camera stream obtained:', mediaStream);
      console.log('Video tracks:', mediaStream.getVideoTracks());
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready and play
        videoRef.current.onloadedmetadata = async () => {
          console.log('Video metadata loaded');
          try {
            await videoRef.current?.play();
            console.log('Video playing successfully');
            setIsCameraReady(true);
            setStream(mediaStream);
            toast.success('Camera đã sẵn sàng');
          } catch (err) {
            console.error('Error playing video:', err);
            toast.error('Không thể phát video. Vui lòng thử lại.');
          }
        };
      } else {
        console.error('Video ref is null');
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      
      let errorMessage = 'Không thể truy cập camera.';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Bạn đã từ chối quyền truy cập camera. Vui lòng cấp quyền trong cài đặt trình duyệt.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Không tìm thấy camera trên thiết bị.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera đang được sử dụng bởi ứng dụng khác.';
      }
      
      toast.error(errorMessage);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraReady(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    stopDetection();
  };

  // Capture frame from video
  const captureFrame = useCallback((): Blob | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.videoWidth === 0) return null;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.8);
    }) as any;
  }, []);

  // Detect flowers in captured frame
  const detectFrame = useCallback(async () => {
    if (isDetecting) return;

    setIsDetecting(true);
    try {
      const frameBlob = await captureFrame();
      if (!frameBlob) {
        setIsDetecting(false);
        return;
      }

      // Convert blob to file
      const file = new File([frameBlob], 'frame.jpg', { type: 'image/jpeg' });

      // Send to AI server
      const response = await aiApi.scanFlower(file);

      if (response.success && response.data) {
        const detectedData: Record<string, number> = response.data;
        
        // Convert to FlowerDetection array
        const results: FlowerDetection[] = Object.entries(detectedData)
          .map(([key, count]) => {
            const flowerInfo = FLOWER_PRICE_LIST[key];
            if (!flowerInfo || count === 0) return null;

            return {
              key,
              displayName: flowerInfo.name,
              count,
              price: flowerInfo.price,
              total: flowerInfo.price * count,
            };
          })
          .filter((item): item is FlowerDetection => item !== null);

        setDetections(results);
        setLastDetectionTime(new Date());
      }
    } catch (error) {
      console.error('Detection error:', error);
      // Don't show toast to avoid spam during continuous detection
    } finally {
      setIsDetecting(false);
    }
  }, [captureFrame, isDetecting]);

  // Start continuous detection
  const startDetection = () => {
    if (!stream || !isCameraReady) {
      toast.error('Vui lòng bật camera trước');
      return;
    }

    setIsRecording(true);
    setDetections([]);
    toast.success('Bắt đầu phát hiện hoa');

    // Detect every 2 seconds to avoid overload
    detectionIntervalRef.current = setInterval(() => {
      detectFrame();
    }, 2000);
  };

  // Stop detection
  const stopDetection = () => {
    setIsRecording(false);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setDetections([]);
  };

  // Take single photo
  const takePhoto = async () => {
    if (!stream || !isCameraReady) {
      toast.error('Vui lòng bật camera trước');
      return;
    }

    toast.info('Đang chụp và phân tích...');
    await detectFrame();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              AI Video - Nhận Diện Hoa
            </h1>
            <p className="text-gray-600">
              Sử dụng camera để phát hiện hoa trong thời gian thực
            </p>
          </div>

          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left: Camera View */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Camera
                    </span>
                    {isRecording && (
                      <Badge variant="destructive" className="animate-pulse">
                        <span className="mr-1 inline-block h-2 w-2 rounded-full bg-white"></span>
                        Đang quét
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Video element */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-900">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full object-cover"
                        style={{ display: isCameraReady ? 'block' : 'none' }}
                      />
                      
                      {!isCameraReady && (
                        <div className="flex h-full w-full flex-col items-center justify-center text-white">
                          <VideoOff className="mb-4 h-16 w-16 opacity-50" />
                          <p className="text-lg">
                            {stream ? 'Đang khởi động camera...' : 'Camera chưa được bật'}
                          </p>
                        </div>
                      )}
                      
                      {isDetecting && isCameraReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                      )}
                    </div>

                    {/* Hidden canvas for capturing frames */}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  {/* Controls */}
                  <div className="mt-4 space-y-2">
                    {!isCameraReady ? (
                      <Button onClick={startCamera} className="w-full" size="lg">
                        <Camera className="mr-2 h-5 w-5" />
                        Bật Camera
                      </Button>
                    ) : (
                      <>
                        {!isRecording ? (
                          <>
                            <Button 
                              onClick={startDetection} 
                              className="w-full" 
                              size="lg"
                            >
                              <Play className="mr-2 h-5 w-5" />
                              Bắt đầu quét liên tục
                            </Button>
                            <Button 
                              onClick={takePhoto} 
                              variant="outline"
                              className="w-full" 
                              size="lg"
                            >
                              <Camera className="mr-2 h-5 w-5" />
                              Chụp ảnh & Phân tích
                            </Button>
                          </>
                        ) : (
                          <Button 
                            onClick={stopDetection} 
                            variant="destructive"
                            className="w-full" 
                            size="lg"
                          >
                            <Square className="mr-2 h-5 w-5" />
                            Dừng quét
                          </Button>
                        )}
                        <Button 
                          onClick={stopCamera} 
                          variant="outline"
                          className="w-full"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Tắt Camera
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Right: Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Kết quả phát hiện</span>
                    {lastDetectionTime && (
                      <span className="text-xs font-normal text-gray-500">
                        Cập nhật: {lastDetectionTime.toLocaleTimeString('vi-VN')}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {detections.length === 0 ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                      <Camera className="mb-4 h-16 w-16 text-gray-300" />
                      <p className="text-gray-500">
                        {isRecording 
                          ? 'Đang quét... Di chuyển camera đến các bông hoa'
                          : 'Chưa có kết quả. Bật camera và bắt đầu quét.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Detections List */}
                      <div className="space-y-3">
                        {detections.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm transition-all animate-in fade-in slide-in-from-right-5"
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
                        <p className="font-semibold">💡 Mẹo sử dụng:</p>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-blue-800">
                          <li>Giữ camera ổn định và hướng thẳng vào hoa</li>
                          <li>Đảm bảo ánh sáng đủ sáng</li>
                          <li>Kết quả được cập nhật mỗi 2 giây</li>
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
