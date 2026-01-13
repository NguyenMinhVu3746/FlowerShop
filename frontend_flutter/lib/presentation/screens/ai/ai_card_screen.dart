import 'package:flutter/material.dart';
import '../../../data/services/ai_service.dart';
import '../../../core/constants/app_colors.dart';

class AICardScreen extends StatefulWidget {
  const AICardScreen({super.key});

  @override
  State<AICardScreen> createState() => _AICardScreenState();
}

class _AICardScreenState extends State<AICardScreen> {
  final AIService _aiService = AIService();
  final _formKey = GlobalKey<FormState>();
  
  String _occasion = '';
  String _recipient = '';
  String _relationship = '';
  String _tone = 'casual';
  
  List<String> _suggestions = [];
  bool _isLoading = false;
  String? _selectedMessage;

  Future<void> _generateMessages() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _suggestions = [];
    });

    try {
      final messages = await _aiService.suggestMessage(
        occasion: _occasion,
        recipient: _recipient,
        relationship: _relationship,
        tone: _tone,
      );

      setState(() {
        _suggestions = messages;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: $e')),
        );
      }
    }
  }
  

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Tạo thiệp'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Icon(
                      Icons.auto_awesome,
                      size: 48,
                      color: AppColors.primary,
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Tạo lời nhắn thiệp tự động',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'AI sẽ giúp bạn tạo những lời chúc ý nghĩa',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Form
              TextFormField(
                decoration: const InputDecoration(
                  labelText: 'Dịp gửi hoa',
                  hintText: 'VD: Sinh nhật, Kỷ niệm, Chúc mừng...',
                  prefixIcon: Icon(Icons.celebration),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Vui lòng nhập dịp gửi hoa';
                  }
                  return null;
                },
                onChanged: (value) => _occasion = value,
              ),
              const SizedBox(height: 16),

              TextFormField(
                decoration: const InputDecoration(
                  labelText: 'Người nhận',
                  hintText: 'VD: Mẹ, Bạn gái, Sếp...',
                  prefixIcon: Icon(Icons.person),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Vui lòng nhập người nhận';
                  }
                  return null;
                },
                onChanged: (value) => _recipient = value,
              ),
              const SizedBox(height: 16),

              TextFormField(
                decoration: const InputDecoration(
                  labelText: 'Mối quan hệ',
                  hintText: 'VD: Con trai, Người yêu, Nhân viên...',
                  prefixIcon: Icon(Icons.family_restroom),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Vui lòng nhập mối quan hệ';
                  }
                  return null;
                },
                onChanged: (value) => _relationship = value,
              ),
              const SizedBox(height: 16),

              // Tone Selection
              const Text(
                'Giọng điệu',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: [
                  ChoiceChip(
                    label: const Text('Thân mật'),
                    selected: _tone == 'casual',
                    onSelected: (selected) {
                      setState(() => _tone = 'casual');
                    },
                  ),
                  ChoiceChip(
                    label: const Text('Trang trọng'),
                    selected: _tone == 'formal',
                    onSelected: (selected) {
                      setState(() => _tone = 'formal');
                    },
                  ),
                  ChoiceChip(
                    label: const Text('Lãng mạn'),
                    selected: _tone == 'romantic',
                    onSelected: (selected) {
                      setState(() => _tone = 'romantic');
                    },
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Generate Button
              ElevatedButton(
                onPressed: _isLoading ? null : _generateMessages,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.auto_awesome),
                          SizedBox(width: 8),
                          Text('Tạo lời nhắn'),
                        ],
                      ),
              ),
              const SizedBox(height: 24),

              // Suggestions
              if (_suggestions.isNotEmpty) ...[
                const Text(
                  'Gợi ý lời nhắn',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                ..._suggestions.asMap().entries.map((entry) {
                  final index = entry.key;
                  final message = entry.value;
                  final isSelected = _selectedMessage == message;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: InkWell(
                      onTap: () {
                        setState(() {
                          _selectedMessage = message;
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.primary.withOpacity(0.1)
                              : Colors.white,
                          border: Border.all(
                            color: isSelected
                                ? AppColors.primary
                                : AppColors.divider,
                            width: isSelected ? 2 : 1,
                          ),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 28,
                                  height: 28,
                                  decoration: BoxDecoration(
                                    color: AppColors.primary,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Center(
                                    child: Text(
                                      '${index + 1}',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                                const Spacer(),
                                if (isSelected)
                                  Icon(
                                    Icons.check_circle,
                                    color: AppColors.primary,
                                  ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              message,
                              style: const TextStyle(
                                fontSize: 15,
                                height: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
                const SizedBox(height: 16),

                // Use Message Button
                if (_selectedMessage != null)
                  ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context, _selectedMessage);
                    },
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('Sử dụng lời nhắn này'),
                  ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
