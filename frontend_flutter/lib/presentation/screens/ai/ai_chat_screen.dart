import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'dart:convert';
import '../../../data/services/ai_service.dart';
import '../../../data/models/ai_model.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/api_constants.dart';
import '../product/product_detail_screen.dart';

class AIChatScreen extends StatefulWidget {
  const AIChatScreen({super.key});

  @override
  State<AIChatScreen> createState() => _AIChatScreenState();
}

class _AIChatScreenState extends State<AIChatScreen> {
  final AIService _aiService = AIService();
  final TextEditingController _messageController = TextEditingController();
  final List<AIChatMessage> _messages = [];
  final ImagePicker _imagePicker = ImagePicker();
  bool _isLoading = false;
  File? _selectedImage;

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );

      if (image != null) {
        setState(() {
          _selectedImage = File(image.path);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi chọn ảnh: $e')));
      }
    }
  }

  Future<String> _fileToBase64(File file) async {
    final bytes = await file.readAsBytes();
    return 'data:image/jpeg;base64,${base64Encode(bytes)}';
  }

  void _sendMessage() async {
    if ((_messageController.text.trim().isEmpty && _selectedImage == null) ||
        _isLoading)
      return;

    final userMessage = _messageController.text;
    final image = _selectedImage;

    setState(() {
      _isLoading = true;
    });

    try {
      final parts = <MessagePart>[];
      if (userMessage.isNotEmpty) {
        parts.add(MessagePart(text: userMessage));
      }
      if (image != null) {
        final base64Image = await _fileToBase64(image);
        parts.add(MessagePart(image: base64Image));
      }

      setState(() {
        _messages.add(AIChatMessage(role: 'user', parts: parts));
        _messageController.clear();
        _selectedImage = null;
      });

      final response = await _aiService.chat(
        message: userMessage,
        image: image != null ? await _fileToBase64(image) : null,
        conversationHistory: _messages,
      );

      print('🤖 AI Response:');
      print('  - response: ${response.response}');
      print('  - imageAnalysis: ${response.imageAnalysis}');
      print('  - suggestions count: ${response.suggestions?.length ?? 0}');
      if (response.suggestions != null) {
        for (var s in response.suggestions!) {
          print('    • ${s.title}');
        }
      }

      setState(() {
        _messages.add(
          AIChatMessage(
            role: 'model',
            parts: [MessagePart(text: response.response)],
            suggestions: response.suggestions,
            imageAnalysis: response.imageAnalysis,
          ),
        );
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('AI Tư vấn')),
      body: Column(
        children: [
          Expanded(
            child: _messages.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.chat_bubble_outline,
                          size: 80,
                          color: AppColors.textTertiary,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Bắt đầu trò chuyện với AI',
                          style: TextStyle(
                            fontSize: 18,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _messages.length + (_isLoading ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == _messages.length) {
                        // Loading indicator
                        return Align(
                          alignment: Alignment.centerLeft,
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.background,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                          ),
                        );
                      }

                      final message = _messages[index];
                      final isUser = message.role == 'user';
                      final textPart = message.parts.firstWhere(
                        (p) => p.text != null,
                        orElse: () => MessagePart(text: ''),
                      );
                      final imagePart = message.parts.firstWhere(
                        (p) => p.image != null,
                        orElse: () => MessagePart(),
                      );

                      return Align(
                        alignment: isUser
                            ? Alignment.centerRight
                            : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isUser
                                ? AppColors.primary
                                : AppColors.background,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          constraints: BoxConstraints(
                            maxWidth: MediaQuery.of(context).size.width * 0.7,
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (imagePart.image != null) ...[
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: Image.memory(
                                    base64Decode(
                                      imagePart.image!.split(',').last,
                                    ),
                                    width: 200,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                const SizedBox(height: 8),
                              ],
                              // Show image analysis FIRST (before text)
                              if (!isUser && message.imageAnalysis != null) ...[
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.blue.shade50,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Icon(
                                            Icons.image_search,
                                            size: 16,
                                            color: Colors.blue.shade700,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            'Phân tích ảnh:',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              color: Colors.blue.shade700,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        message.imageAnalysis!,
                                        style: TextStyle(
                                          color: Colors.blue.shade900,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 8),
                              ],
                              // Then show main text response
                              if (textPart.text?.isNotEmpty ?? false)
                                Text(
                                  textPart.text!,
                                  style: TextStyle(
                                    color: isUser
                                        ? Colors.white
                                        : AppColors.textPrimary,
                                  ),
                                ),
                              // Show product suggestions if available
                              if (!isUser &&
                                  message.suggestions != null &&
                                  message.suggestions!.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Icon(
                                          Icons.recommend,
                                          size: 16,
                                          color: Colors.green.shade700,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          'Sản phẩm gợi ý (${message.suggestions!.length}):',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: Colors.green.shade700,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    ...message.suggestions!.map((suggestion) {
                                      print(
                                        '🖼️ Product image path: ${suggestion.image}',
                                      );
                                      return GestureDetector(
                                        onTap: () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(
                                              builder: (context) =>
                                                  ProductDetailScreen(
                                                    slug: suggestion.slug,
                                                  ),
                                            ),
                                          );
                                        },
                                        child: Container(
                                          margin: const EdgeInsets.only(
                                            bottom: 8,
                                          ),
                                          padding: const EdgeInsets.all(8),
                                          decoration: BoxDecoration(
                                            color: Colors.white,
                                            border: Border.all(
                                              color: Colors.green.shade200,
                                            ),
                                            borderRadius: BorderRadius.circular(
                                              8,
                                            ),
                                          ),
                                          child: Row(
                                            children: [
                                              // Product Image
                                              Container(
                                                width: 60,
                                                height: 60,
                                                decoration: BoxDecoration(
                                                  color: Colors.grey.shade100,
                                                  borderRadius:
                                                      BorderRadius.circular(6),
                                                ),
                                                child: suggestion.image != null
                                                    ? ClipRRect(
                                                        borderRadius:
                                                            BorderRadius.circular(
                                                              6,
                                                            ),
                                                        child: Image.network(
                                                          '${ApiConstants.imageBaseUrl}/${suggestion.image}',
                                                          fit: BoxFit.cover,
                                                          errorBuilder:
                                                              (
                                                                context,
                                                                error,
                                                                stackTrace,
                                                              ) {
                                                                return Icon(
                                                                  Icons
                                                                      .local_florist,
                                                                  color: Colors
                                                                      .grey
                                                                      .shade400,
                                                                );
                                                              },
                                                        ),
                                                      )
                                                    : Icon(
                                                        Icons.local_florist,
                                                        color: Colors
                                                            .grey
                                                            .shade400,
                                                      ),
                                              ),
                                              const SizedBox(width: 12),
                                              // Product Info
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      suggestion.title,
                                                      style: const TextStyle(
                                                        fontWeight:
                                                            FontWeight.w600,
                                                        fontSize: 13,
                                                      ),
                                                      maxLines: 2,
                                                      overflow:
                                                          TextOverflow.ellipsis,
                                                    ),
                                                    const SizedBox(height: 4),
                                                    if (suggestion
                                                        .prices
                                                        .isNotEmpty)
                                                      Text(
                                                        () {
                                                          final price = suggestion
                                                              .prices[0]['price'];
                                                          final numPrice =
                                                              price is num
                                                              ? price
                                                              : num.tryParse(
                                                                      price
                                                                          .toString(),
                                                                    ) ??
                                                                    0;
                                                          return '${numPrice.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}đ';
                                                        }(),
                                                        style: TextStyle(
                                                          color:
                                                              AppColors.primary,
                                                          fontWeight:
                                                              FontWeight.bold,
                                                          fontSize: 14,
                                                        ),
                                                      ),
                                                  ],
                                                ),
                                              ),
                                              Icon(
                                                Icons.arrow_forward_ios,
                                                size: 14,
                                                color: Colors.grey.shade400,
                                              ),
                                            ],
                                          ),
                                        ),
                                      );
                                    }),
                                  ],
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                ),
              ],
            ),
            child: SafeArea(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (_selectedImage != null)
                    Container(
                      padding: const EdgeInsets.all(8),
                      child: Stack(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.file(
                              _selectedImage!,
                              height: 100,
                              width: 100,
                              fit: BoxFit.cover,
                            ),
                          ),
                          Positioned(
                            top: 0,
                            right: 0,
                            child: IconButton(
                              icon: const Icon(
                                Icons.close,
                                color: Colors.white,
                              ),
                              onPressed: () =>
                                  setState(() => _selectedImage = null),
                              style: IconButton.styleFrom(
                                backgroundColor: Colors.black54,
                                padding: EdgeInsets.zero,
                                minimumSize: const Size(32, 32),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  Row(
                    children: [
                      IconButton(
                        icon: Icon(
                          Icons.image,
                          color: _selectedImage != null
                              ? AppColors.primary
                              : null,
                        ),
                        onPressed: _pickImage,
                      ),
                      Expanded(
                        child: TextField(
                          controller: _messageController,
                          decoration: const InputDecoration(
                            hintText: 'Nhập tin nhắn...',
                            border: OutlineInputBorder(),
                          ),
                          onSubmitted: (_) => _sendMessage(),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: const Icon(Icons.send),
                        color: AppColors.primary,
                        onPressed: _sendMessage,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
