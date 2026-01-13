import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Trợ giúp')),
      body: ListView(
        children: [
          // Contact Section
          _buildSectionHeader('Liên hệ hỗ trợ'),
          ListTile(
            leading: const Icon(Icons.phone),
            title: const Text('Hotline'),
            subtitle: const Text('1900 xxxx (8:00 - 22:00)'),
            trailing: const Icon(Icons.call),
            onTap: () {
              // TODO: Open dialer
            },
          ),
          ListTile(
            leading: const Icon(Icons.email),
            title: const Text('Email hỗ trợ'),
            subtitle: const Text('support@hoashop.com'),
            trailing: const Icon(Icons.send),
            onTap: () {
              // TODO: Open email app
            },
          ),
          ListTile(
            leading: const Icon(Icons.chat),
            title: const Text('Chat với tư vấn viên'),
            subtitle: const Text('Phản hồi nhanh trong vài phút'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              // TODO: Open chat
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Tính năng đang phát triển')),
              );
            },
          ),
          const Divider(),

          // FAQ Section
          _buildSectionHeader('Câu hỏi thường gặp'),
          _buildFAQItem(
            context,
            'Làm thế nào để đặt hàng?',
            'Bạn chọn sản phẩm muốn mua, thêm vào giỏ hàng, sau đó điền thông tin giao hàng và thanh toán. Đơn hàng của bạn sẽ được xác nhận trong vòng 24h.',
          ),
          _buildFAQItem(
            context,
            'Thời gian giao hàng bao lâu?',
            'Thời gian giao hàng từ 2-5 ngày tùy theo địa chỉ của bạn. Đơn hàng nội thành Hà Nội/TP.HCM thường giao trong 1-2 ngày.',
          ),
          _buildFAQItem(
            context,
            'Làm thế nào để hủy đơn hàng?',
            'Bạn có thể hủy đơn hàng khi đơn hàng đang ở trạng thái "Chờ xác nhận". Với các đơn hàng đã xác nhận, vui lòng liên hệ hotline để được hỗ trợ.',
          ),
          _buildFAQItem(
            context,
            'Chính sách đổi trả như thế nào?',
            'Sản phẩm có thể đổi trả trong vòng 7 ngày kể từ khi nhận hàng, nếu sản phẩm còn nguyên tem mác, chưa qua sử dụng và không bị hư hỏng.',
          ),
          _buildFAQItem(
            context,
            'Làm thế nào để sử dụng mã giảm giá?',
            'Tại trang thanh toán, bạn nhập mã giảm giá vào ô "Mã giảm giá" và nhấn "Áp dụng". Hệ thống sẽ tự động tính toán số tiền được giảm.',
          ),
          _buildFAQItem(
            context,
            'Thông tin cá nhân có được bảo mật không?',
            'HoaShop cam kết bảo mật 100% thông tin cá nhân của khách hàng. Thông tin chỉ được sử dụng để xử lý đơn hàng và không chia sẻ cho bên thứ ba.',
          ),
          const Divider(),

          // Guides Section
          _buildSectionHeader('Hướng dẫn sử dụng'),
          ListTile(
            leading: const Icon(Icons.book),
            title: const Text('Hướng dẫn đặt hàng'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              _showGuideDialog(context, 'Hướng dẫn đặt hàng', '''
1. Tìm sản phẩm bạn muốn mua
2. Chọn kích thước và số lượng
3. Thêm vào giỏ hàng
4. Kiểm tra giỏ hàng và bấm "Thanh toán"
5. Điền thông tin người nhận
6. Chọn phương thức thanh toán
7. Xác nhận đơn hàng
              ''');
            },
          ),
          ListTile(
            leading: const Icon(Icons.payment),
            title: const Text('Hướng dẫn thanh toán'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              _showGuideDialog(context, 'Hướng dẫn thanh toán', '''
HoaShop hỗ trợ các phương thức thanh toán:

• Thanh toán khi nhận hàng (COD)
• Chuyển khoản ngân hàng
• Ví điện tử (MoMo, ZaloPay)
• Thẻ tín dụng/ghi nợ

Chọn phương thức phù hợp tại bước thanh toán.
              ''');
            },
          ),
          ListTile(
            leading: const Icon(Icons.local_shipping),
            title: const Text('Hướng dẫn theo dõi đơn hàng'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              _showGuideDialog(context, 'Hướng dẫn theo dõi đơn hàng', '''
Tại tab "Hồ sơ" > "Đơn hàng của tôi":

1. Xem tất cả đơn hàng
2. Lọc theo trạng thái
3. Bấm vào đơn hàng để xem chi tiết
4. Theo dõi trạng thái vận chuyển
              ''');
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: AppColors.primary,
        ),
      ),
    );
  }

  Widget _buildFAQItem(BuildContext context, String question, String answer) {
    return ExpansionTile(
      title: Text(
        question,
        style: const TextStyle(fontWeight: FontWeight.w500),
      ),
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          child: Text(answer, style: TextStyle(color: AppColors.textSecondary)),
        ),
      ],
    );
  }

  void _showGuideDialog(BuildContext context, String title, String content) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: SingleChildScrollView(child: Text(content)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }
}
