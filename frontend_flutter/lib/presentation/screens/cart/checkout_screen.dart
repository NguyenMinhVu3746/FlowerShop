import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/cart_provider.dart';
import '../../../data/services/user_service.dart';
import '../../../data/services/checkout_service.dart';
import '../../../data/services/ai_service.dart';
import '../../../data/services/voucher_service.dart';
import '../../../data/models/user_model.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/app_utils.dart';
import '../profile/addresses_screen.dart';
import '../main_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final UserService _userService = UserService();
  final CheckoutService _checkoutService = CheckoutService();
  final AIService _aiService = AIService();
  final VoucherService _voucherService = VoucherService();
  
  final _formKey = GlobalKey<FormState>();
  final _deliveryDateController = TextEditingController();
  final _noteController = TextEditingController();
  final _messageCardController = TextEditingController();
  final _voucherController = TextEditingController();

  List<Address> _addresses = [];
  Address? _selectedAddress;
  User? _currentUser;
  String _selectedDeliverySlot = '08:00-10:00';
  String _paymentMethod = 'COD';
  String _senderType = 'NAMED';
  bool _isLoadingAddresses = false;
  bool _isSubmitting = false;
  bool _showAIForm = false;
  bool _isLoadingAI = false;
  bool _isValidatingVoucher = false;
  double _voucherDiscount = 0;
  Map<String, dynamic>? _appliedVoucher;
  List<String> _aiMessages = [];
  
  final List<Map<String, String>> _deliverySlots = [
    {'value': '08:00-10:00', 'label': '8:00 - 10:00'},
    {'value': '10:00-12:00', 'label': '10:00 - 12:00'},
    {'value': '14:00-16:00', 'label': '14:00 - 16:00'},
    {'value': '16:00-18:00', 'label': '16:00 - 18:00'},
  ];

  final List<Map<String, String>> _paymentMethods = [
    {'value': 'COD', 'label': 'Thanh toán khi nhận hàng (COD)'},
    {'value': 'BANK_TRANSFER', 'label': 'Chuyển khoản ngân hàng'},
    {'value': 'MOMO', 'label': 'Ví MoMo'},
    {'value': 'VNPAY', 'label': 'VNPAY'},
  ];

  // AI params
  String _occasion = 'birthday';
  String _recipient = '';
  String _relationship = 'family';
  String _tone = 'casual';

  @override
  void initState() {
    super.initState();
    _loadAddresses();
    _loadUserInfo();
    // Set min date to today
    _deliveryDateController.text = DateTime.now().add(const Duration(days: 1)).toString().split(' ')[0];
  }

  @override
  void dispose() {
    _deliveryDateController.dispose();
    _noteController.dispose();
    _messageCardController.dispose();
    _voucherController.dispose();
    super.dispose();
  }

  Future<void> _loadAddresses() async {
    setState(() => _isLoadingAddresses = true);

    try {
      final addresses = await _userService.getAddresses();
      setState(() {
        _addresses = addresses;
        // Auto-select default or first address
        if (addresses.isNotEmpty) {
          _selectedAddress = addresses.firstWhere(
            (addr) => addr.isDefault,
            orElse: () => addresses.first,
          );
        }
        _isLoadingAddresses = false;
      });
    } catch (e) {
      setState(() => _isLoadingAddresses = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: $e')),
        );
      }
    }
  }

  Future<void> _loadUserInfo() async {
    try {
      final user = await _userService.getProfile();
      setState(() => _currentUser = user);
    } catch (e) {
      print('❌ Load user error: $e');
    }
  }

  Future<void> _handleApplyVoucher(double totalAmount) async {
    final code = _voucherController.text.trim();
    if (code.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập mã giảm giá')),
      );
      return;
    }

    setState(() => _isValidatingVoucher = true);

    try {
      final result = await _voucherService.validateVoucher(
        code: code,
        totalPrice: totalAmount,
      );

      setState(() => _isValidatingVoucher = false);

      if (result['valid']) {
        setState(() {
          _appliedVoucher = Map<String, dynamic>.from(result['voucher'] as Map);
          _voucherDiscount = (result['discount'] as num).toDouble();
        });
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                '✅ Áp dụng thành công! Giảm ${AppUtils.formatCurrency(_voucherDiscount)}',
              ),
              backgroundColor: Colors.green,
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(result['message'] ?? 'Mã không hợp lệ'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      setState(() => _isValidatingVoucher = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: $e')),
        );
      }
    }
  }

  void _handleRemoveVoucher() {
    setState(() {
      _appliedVoucher = null;
      _voucherDiscount = 0;
      _voucherController.clear();
    });
  }

  Future<void> _handleAISuggest() async {
    if (_recipient.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập tên người nhận')),
      );
      return;
    }

    setState(() => _isLoadingAI = true);

    try {
      print('🤖 Calling AI service with: occasion=$_occasion, recipient=$_recipient, relationship=$_relationship, tone=$_tone');
      
      final messages = await _aiService.suggestMessage(
        occasion: _occasion,
        recipient: _recipient,
        relationship: _relationship,
        tone: _tone,
      );

      print('🤖 Received ${messages.length} messages: $messages');

      if (messages.isEmpty) {
        throw Exception('Không nhận được lời chúc từ AI');
      }

      setState(() {
        _aiMessages = messages;
        _showAIForm = false;
        _isLoadingAI = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('✨ Đã tạo ${messages.length} lời chúc!')),
        );
      }
    } catch (e) {
      print('❌ AI error: $e');
      setState(() => _isLoadingAI = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: ${e.toString()}')),
        );
      }
    }
  }

  void _showAddressSelector() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.7,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Chọn địa chỉ giao hàng',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Flexible(
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: _addresses.length,
                itemBuilder: (context, index) {
                  final address = _addresses[index];
                  final isSelected = _selectedAddress?.id == address.id;
                  
                  return InkWell(
                    onTap: () {
                      setState(() => _selectedAddress = address);
                      Navigator.pop(context);
                    },
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary.withOpacity(0.1) : null,
                        border: Border.all(
                          color: isSelected ? AppColors.primary : AppColors.divider,
                        ),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Radio<String>(
                            value: address.id,
                            groupValue: _selectedAddress?.id,
                            onChanged: (value) {
                              setState(() => _selectedAddress = address);
                              Navigator.pop(context);
                            },
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(
                                      address.title,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.secondary,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      address.nameReceiver,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    if (address.isDefault) ...[
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 6,
                                          vertical: 2,
                                        ),
                                        decoration: BoxDecoration(
                                          color: AppColors.primary.withOpacity(0.1),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: const Text(
                                          '⭐',
                                          style: TextStyle(fontSize: 10),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  address.phoneReceiver,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  address.fullAddress,
                                  style: const TextStyle(fontSize: 13),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleCheckout() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedAddress == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn địa chỉ giao hàng')),
      );
      return;
    }

    final cartProvider = Provider.of<CartProvider>(context, listen: false);
    if (cartProvider.items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Giỏ hàng trống')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      await _checkoutService.checkout(
        items: cartProvider.items.map((item) => {
          'variantId': item.variantId,
          'quantity': item.quantity,
        }).toList(),
        receiver: {
          'name': _selectedAddress!.nameReceiver,
          'phone': _selectedAddress!.phoneReceiver.toString(),
          'address': _selectedAddress!.fullAddress,
          'deliveryDate': _deliveryDateController.text,
          'deliverySlot': _selectedDeliverySlot,
        },
        paymentMethod: _paymentMethod,
        voucherCode: _appliedVoucher != null 
            ? (_appliedVoucher!['code'] ?? '').toString()
            : null,
        note: _noteController.text.trim().isNotEmpty 
            ? _noteController.text.trim() 
            : null,
        messageCard: _messageCardController.text.trim().isNotEmpty 
            ? _messageCardController.text.trim() 
            : null,
        senderType: _senderType,
      );

      // Clear cart
      cartProvider.clearCart();

      setState(() => _isSubmitting = false);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Đặt hàng thành công!'),
            duration: Duration(seconds: 2),
          ),
        );
        // Navigate to Profile tab where user can see Orders
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (context) => const MainScreen(initialIndex: 4)),
          (route) => false,
        );
      }
    } catch (e) {
      setState(() => _isSubmitting = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Đặt hàng thất bại: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thanh toán'),
      ),
      body: Consumer<CartProvider>(
        builder: (context, cartProvider, child) {
          if (cartProvider.items.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.shopping_cart_outlined,
                    size: 80,
                    color: AppColors.textTertiary,
                  ),
                  const SizedBox(height: 16),
                  const Text('Giỏ hàng trống'),
                ],
              ),
            );
          }

          final shippingFee = cartProvider.totalAmount >= 500000 ? 0.0 : 30000.0;
          final finalTotal = cartProvider.totalAmount + shippingFee - _voucherDiscount;

          return Form(
            key: _formKey,
            child: Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildAddressSection(),
                        const SizedBox(height: 16),
                        _buildDeliverySection(),
                        const SizedBox(height: 16),
                        _buildMessageSection(),
                        const SizedBox(height: 16),
                        _buildPaymentSection(),
                        const SizedBox(height: 16),
                        _buildVoucherSection(cartProvider.totalAmount),
                      ],
                    ),
                  ),
                ),
                _buildSummary(cartProvider.totalAmount, shippingFee, finalTotal),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildAddressSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Địa chỉ giao hàng',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton.icon(
                  onPressed: () async {
                    await Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const AddressesScreen(),
                      ),
                    );
                    _loadAddresses();
                  },
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Thêm mới'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (_isLoadingAddresses)
              const Center(child: CircularProgressIndicator())
            else if (_addresses.isEmpty)
              Center(
                child: Column(
                  children: [
                    const Text('Chưa có địa chỉ nào'),
                    TextButton(
                      onPressed: () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const AddressesScreen(),
                          ),
                        );
                        _loadAddresses();
                      },
                      child: const Text('Thêm địa chỉ'),
                    ),
                  ],
                ),
              )
            else if (_selectedAddress != null)
              InkWell(
                onTap: () => _showAddressSelector(),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.05),
                    border: Border.all(
                      color: AppColors.primary,
                      width: 1.5,
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(
                                  _selectedAddress!.title,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.secondary,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  _selectedAddress!.nameReceiver,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                if (_selectedAddress!.isDefault) ...[
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 6,
                                      vertical: 2,
                                    ),
                                    decoration: BoxDecoration(
                                      color: AppColors.primary.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: const Text(
                                      '⭐',
                                      style: TextStyle(fontSize: 10),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _selectedAddress!.phoneReceiver,
                              style: TextStyle(
                                fontSize: 13,
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              _selectedAddress!.fullAddress,
                              style: const TextStyle(fontSize: 13),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Column(
                        children: [
                          Icon(Icons.chevron_right, color: AppColors.primary),
                          const SizedBox(height: 4),
                          Text(
                            'Đổi',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppColors.primary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeliverySection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Thông tin giao hàng',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _deliveryDateController,
              decoration: const InputDecoration(
                labelText: 'Ngày giao hàng *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.calendar_today),
              ),
              readOnly: true,
              onTap: () async {
                final date = await showDatePicker(
                  context: context,
                  initialDate: DateTime.now().add(const Duration(days: 1)),
                  firstDate: DateTime.now().add(const Duration(days: 1)),
                  lastDate: DateTime.now().add(const Duration(days: 30)),
                );
                if (date != null) {
                  _deliveryDateController.text = date.toString().split(' ')[0];
                }
              },
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Vui lòng chọn ngày giao hàng';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _selectedDeliverySlot,
              decoration: const InputDecoration(
                labelText: 'Khung giờ giao *',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.access_time),
              ),
              items: _deliverySlots.map((slot) {
                return DropdownMenuItem(
                  value: slot['value'],
                  child: Text(slot['label']!),
                );
              }).toList(),
              onChanged: (value) {
                setState(() => _selectedDeliverySlot = value!);
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _noteController,
              decoration: const InputDecoration(
                labelText: 'Ghi chú (tùy chọn)',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.note),
              ),
              maxLines: 2,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Thiệp chúc mừng',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton.icon(
                  onPressed: () => setState(() => _showAIForm = !_showAIForm),
                  icon: const Icon(Icons.auto_awesome, size: 18),
                  label: const Text('AI gợi ý'),
                ),
              ],
            ),
            if (_showAIForm) ...[
              const SizedBox(height: 12),
              _buildAIForm(),
            ],
            if (_aiMessages.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Text(
                'Chọn lời chúc AI gợi ý:',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              ..._aiMessages.map((msg) => Card(
                color: AppColors.surface,
                margin: const EdgeInsets.only(bottom: 8),
                child: InkWell(
                  onTap: () {
                    setState(() {
                      _messageCardController.text = msg;
                    });
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Text(msg, style: const TextStyle(fontSize: 14)),
                  ),
                ),
              )),
            ],
            const SizedBox(height: 12),
            TextFormField(
              controller: _messageCardController,
              decoration: const InputDecoration(
                labelText: 'Lời nhắn trên thiệp',
                border: OutlineInputBorder(),
              ),
              maxLines: 4,
            ),
            const SizedBox(height: 12),
            const Text(
              'Người gửi:',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: RadioListTile<String>(
                    title: Text(
                      _currentUser != null ? 'Ghi tên (${_currentUser!.fullname})' : 'Ghi tên',
                      style: const TextStyle(fontSize: 14),
                    ),
                    value: 'NAMED',
                    groupValue: _senderType,
                    onChanged: (value) => setState(() => _senderType = value!),
                    contentPadding: EdgeInsets.zero,
                    dense: true,
                  ),
                ),
                Expanded(
                  child: RadioListTile<String>(
                    title: const Text('Ẩn danh', style: TextStyle(fontSize: 14)),
                    value: 'ANONYMOUS',
                    groupValue: _senderType,
                    onChanged: (value) => setState(() => _senderType = value!),
                    contentPadding: EdgeInsets.zero,
                    dense: true,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAIForm() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.05),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.primary.withOpacity(0.2)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _occasion,
                  decoration: const InputDecoration(
                    labelText: 'Dịp',
                    border: OutlineInputBorder(),
                    isDense: true,
                  ),
                  items: const [
                    DropdownMenuItem(value: 'birthday', child: Text('Sinh nhật')),
                    DropdownMenuItem(value: 'anniversary', child: Text('Kỷ niệm')),
                    DropdownMenuItem(value: 'thanks', child: Text('Cảm ơn')),
                    DropdownMenuItem(value: 'apology', child: Text('Xin lỗi')),
                    DropdownMenuItem(value: 'congratulation', child: Text('Chúc mừng')),
                    DropdownMenuItem(value: 'getwell', child: Text('Mau khỏe')),
                    DropdownMenuItem(value: 'love', child: Text('Tình yêu')),
                  ],
                  onChanged: (value) => setState(() => _occasion = value!),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  decoration: const InputDecoration(
                    labelText: 'Người nhận *',
                    border: OutlineInputBorder(),
                    isDense: true,
                  ),
                  onChanged: (value) => _recipient = value,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _relationship,
                  decoration: const InputDecoration(
                    labelText: 'Mối quan hệ',
                    border: OutlineInputBorder(),
                    isDense: true,
                  ),
                  items: const [
                    DropdownMenuItem(value: 'family', child: Text('Gia đình')),
                    DropdownMenuItem(value: 'friend', child: Text('Bạn bè')),
                    DropdownMenuItem(value: 'lover', child: Text('Người yêu')),
                    DropdownMenuItem(value: 'colleague', child: Text('Đồng nghiệp')),
                    DropdownMenuItem(value: 'boss', child: Text('Cấp trên')),
                    DropdownMenuItem(value: 'customer', child: Text('Khách hàng')),
                  ],
                  onChanged: (value) => setState(() => _relationship = value!),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _tone,
                  decoration: const InputDecoration(
                    labelText: 'Phong cách',
                    border: OutlineInputBorder(),
                    isDense: true,
                  ),
                  items: const [
                    DropdownMenuItem(value: 'casual', child: Text('Thân mật')),
                    DropdownMenuItem(value: 'formal', child: Text('Trang trọng')),
                    DropdownMenuItem(value: 'romantic', child: Text('Lãng mạn')),
                  ],
                  onChanged: (value) => setState(() => _tone = value!),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _isLoadingAI ? null : _handleAISuggest,
              icon: _isLoadingAI
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.auto_awesome, size: 18),
              label: Text(_isLoadingAI ? 'Đang tạo...' : 'Tạo lời chúc'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Phương thức thanh toán',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ..._paymentMethods.map((method) {
              return RadioListTile<String>(
                title: Text(method['label']!),
                value: method['value']!,
                groupValue: _paymentMethod,
                onChanged: (value) {
                  setState(() => _paymentMethod = value!);
                },
                contentPadding: EdgeInsets.zero,
                dense: true,
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildVoucherSection(double totalAmount) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.local_offer, color: AppColors.primary, size: 22),
                const SizedBox(width: 8),
                const Text(
                  'Mã giảm giá',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (_appliedVoucher != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.green.shade200),
                ),
                child: Row(
                  children: [
                    Icon(Icons.check_circle, color: Colors.green, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            (_appliedVoucher!['code'] ?? '').toString(),
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                          if (_appliedVoucher!['description'] != null)
                            Text(
                              (_appliedVoucher!['description'] ?? '').toString(),
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[700],
                              ),
                            ),
                          Text(
                            'Giảm ${AppUtils.formatCurrency(_voucherDiscount)}',
                            style: const TextStyle(
                              color: Colors.green,
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: _handleRemoveVoucher,
                      icon: const Icon(Icons.close, size: 20),
                      color: Colors.red,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
              ),
            ] else ...[
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _voucherController,
                      decoration: InputDecoration(
                        labelText: 'Nhập mã giảm giá',
                        border: const OutlineInputBorder(),
                        prefixIcon: const Icon(Icons.confirmation_number),
                        suffixIcon: _voucherController.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear, size: 20),
                                onPressed: () {
                                  _voucherController.clear();
                                  setState(() {});
                                },
                              )
                            : null,
                      ),
                      textCapitalization: TextCapitalization.characters,
                      onChanged: (value) => setState(() {}),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: _isValidatingVoucher
                        ? null
                        : () => _handleApplyVoucher(totalAmount),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 16,
                      ),
                    ),
                    child: _isValidatingVoucher
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Áp dụng'),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSummary(double subtotal, double shippingFee, double total) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Tạm tính:'),
                Text(AppUtils.formatPrice(subtotal)),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Phí vận chuyển:'),
                Text(
                  shippingFee == 0 ? 'Miễn phí' : AppUtils.formatPrice(shippingFee),
                  style: TextStyle(
                    color: shippingFee == 0 ? AppColors.success : null,
                  ),
                ),
              ],
            ),
            if (_voucherDiscount > 0) ...[
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Giảm giá:'),
                  Text(
                    '-${AppUtils.formatPrice(_voucherDiscount)}',
                    style: const TextStyle(color: AppColors.success),
                  ),
                ],
              ),
            ],
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Tổng cộng:',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  AppUtils.formatPrice(total),
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _handleCheckout,
                child: _isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text(
                        'Đặt hàng',
                        style: TextStyle(fontSize: 16),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
