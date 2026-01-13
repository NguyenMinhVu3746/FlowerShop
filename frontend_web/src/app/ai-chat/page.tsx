'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import {
  Send,
  Camera,
  X,
  Loader2,
  Bot,
  User,
  ImageIcon,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { aiApi } from '@/lib/api/ai';
import { getImageUrl, formatPrice } from '@/lib/utils';
import type { AIChatMessage, AIProductSuggestion } from '@/types';

// Simple markdown renderer for **bold** text
const renderMarkdown = (text: string) => {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => 
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
};

export default function AIChatPage() {
  const [conversationHistory, setConversationHistory] = useState<
    AIChatMessage[]
  >([]);
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: async ({ userMsg, history }: { userMsg: AIChatMessage; history: AIChatMessage[] }) => {
      const response = await aiApi.chat({
        message: userMsg.parts.find(p => p.text)?.text || undefined,
        image: userMsg.parts.find(p => p.image)?.image || undefined,
        conversationHistory: history,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (!data) {
        toast.error('Không nhận được phản hồi từ AI');
        return;
      }

      // Add AI response to history
      const aiMessage: AIChatMessage = {
        role: 'model',
        parts: [{ text: data.response || 'Xin lỗi, tôi không thể trả lời câu hỏi này.' }],
      };

      // Add suggestions if available
      if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        (aiMessage as any).suggestions = data.suggestions;
      }

      // Add image analysis if available
      if (data.imageAnalysis) {
        (aiMessage as any).imageAnalysis = data.imageAnalysis;
      }

      setConversationHistory(prev => [...prev, aiMessage]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh phải nhỏ hơn 5MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      setImagePreview(URL.createObjectURL(file));
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !selectedImage) {
      toast.error('Vui lòng nhập tin nhắn hoặc chọn ảnh');
      return;
    }

    // Create user message
    const userMessage: AIChatMessage = {
      role: 'user',
      parts: [],
    };
    if (message) userMessage.parts.push({ text: message });
    if (selectedImage) userMessage.parts.push({ image: selectedImage });

    // Add user message to history immediately
    const newHistory = [...conversationHistory, userMessage];
    setConversationHistory(newHistory);

    // Send to API
    chatMutation.mutate({ 
      userMsg: userMessage, 
      history: conversationHistory 
    });

    // Clear input
    setMessage('');
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, chatMutation.isPending]);

  return (
    <div className="container mx-auto max-w-5xl h-[calc(100vh-80px)] flex flex-col py-4 px-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg p-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Shopping Assistant</h1>
            <p className="text-sm text-white/80">
              Tôi có thể giúp bạn tìm hoa hoàn hảo! Gửi ảnh hoặc mô tả nhu cầu
              nhé 🌸
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-card border-x p-4 space-y-4">
        {conversationHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center mb-6">
              <Bot className="h-12 w-12 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              Chào mừng bạn đến với AI Chat!
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Bạn có thể gửi tin nhắn hoặc ảnh để tôi giúp tìm kiếm sản phẩm
              phù hợp
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
              <button
                onClick={() =>
                  setMessage('Tôi muốn tặng hoa sinh nhật cho bạn gái')
                }
                className="p-4 border rounded-lg hover:bg-muted text-left transition-colors"
              >
                <p className="font-medium mb-1">🎂 Hoa sinh nhật</p>
                <p className="text-sm text-muted-foreground">
                  Tìm hoa tặng sinh nhật
                </p>
              </button>
              <button
                onClick={() => setMessage('Hoa khai trương công ty')}
                className="p-4 border rounded-lg hover:bg-muted text-left transition-colors"
              >
                <p className="font-medium mb-1">🎊 Hoa khai trương</p>
                <p className="text-sm text-muted-foreground">
                  Hoa chúc mừng khai trương
                </p>
              </button>
              <button
                onClick={() => setMessage('Hoa tặng mẹ ngày 8/3')}
                className="p-4 border rounded-lg hover:bg-muted text-left transition-colors"
              >
                <p className="font-medium mb-1">❤️ Hoa tặng mẹ</p>
                <p className="text-sm text-muted-foreground">
                  Hoa dành cho mẹ yêu
                </p>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-4 border rounded-lg hover:bg-muted text-left transition-colors"
              >
                <p className="font-medium mb-1">📷 Gửi ảnh hoa</p>
                <p className="text-sm text-muted-foreground">
                  Tìm hoa giống ảnh
                </p>
              </button>
            </div>
          </div>
        ) : (
          <>
            {conversationHistory.map((msg, index) => (
              <div key={index}>
                {/* User Message */}
                {msg.role === 'user' && (
                  <div className="flex justify-end mb-4">
                    <div className="flex items-start gap-2 max-w-[80%]">
                      <div className="space-y-2">
                        {msg.parts.map((part, partIndex) => (
                          <div key={partIndex}>
                            {part.text && (
                              <div className="bg-primary text-primary-foreground rounded-lg p-3">
                                <p className="text-sm whitespace-pre-wrap">
                                  {part.text}
                                </p>
                              </div>
                            )}
                            {part.image && (
                              <div className="relative w-48 h-48 rounded-lg overflow-hidden">
                                <Image
                                  src={part.image}
                                  alt="User uploaded"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Message */}
                {msg.role === 'model' && (
                  <div className="flex justify-start mb-4">
                    <div className="flex items-start gap-2 max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="space-y-3">
                        {msg.imageAnalysis && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-purple-900 mb-1 flex items-center gap-1">
                              <ImageIcon className="h-4 w-4" />
                              Phân tích ảnh
                            </p>
                            <p className="text-sm text-purple-700 whitespace-pre-wrap">
                              {renderMarkdown(msg.imageAnalysis)}
                            </p>
                          </div>
                        )}

                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-sm whitespace-pre-wrap">
                            {renderMarkdown(msg.parts[0]?.text || '')}
                          </p>
                        </div>

                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              Gợi ý sản phẩm ({msg.suggestions.length})
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {msg.suggestions.map((product: AIProductSuggestion) => (
                                <Link
                                  key={product.id}
                                  href={`/products/${product.slug}`}
                                  className="block"
                                >
                                  <Card className="p-3 hover:shadow-md transition-shadow">
                                    <div className="flex gap-3">
                                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                        <Image
                                          src={getImageUrl(product.image)}
                                          alt={product.title}
                                          fill
                                          className="object-cover"
                                          unoptimized
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm line-clamp-2 mb-1">
                                          {product.title}
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {product.category?.name || 'Khác'}
                                          </Badge>
                                        </div>
                                        <p className="text-sm font-semibold text-primary mt-1">
                                          {product.prices?.[0]?.price ? 
                                            formatPrice(product.prices[0].price) : '0'
                                          }đ
                                        </p>
                                      </div>
                                    </div>
                                  </Card>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading State */}
            {chatMutation.isPending && (
              <div className="flex justify-start mb-4">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-card border-x border-b rounded-b-lg p-4 flex-shrink-0">
        <form onSubmit={handleSubmit}>
          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Input Row */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={chatMutation.isPending}
            >
              <Camera className="h-5 w-5" />
            </Button>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn... (Shift + Enter để xuống dòng)"
              className="flex-1 min-h-[60px] max-h-[120px] resize-none"
              disabled={chatMutation.isPending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={
                chatMutation.isPending || (!message.trim() && !selectedImage)
              }
              className="h-[60px] w-[60px]"
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
