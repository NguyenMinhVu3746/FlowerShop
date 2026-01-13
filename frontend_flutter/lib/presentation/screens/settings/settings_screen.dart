import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _emailNotifications = true;
  bool _orderUpdates = true;
  bool _promotions = false;
  String _language = 'vi';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Cài đặt')),
      body: ListView(
        children: [
          // Notifications Section
          _buildSectionHeader('Thông báo'),
          _buildSwitchTile(
            'Bật thông báo',
            'Nhận thông báo từ ứng dụng',
            _notificationsEnabled,
            (value) => setState(() => _notificationsEnabled = value),
          ),
          _buildSwitchTile(
            'Email thông báo',
            'Nhận thông báo qua email',
            _emailNotifications,
            (value) => setState(() => _emailNotifications = value),
          ),
          _buildSwitchTile(
            'Cập nhật đơn hàng',
            'Thông báo về trạng thái đơn hàng',
            _orderUpdates,
            (value) => setState(() => _orderUpdates = value),
          ),
          _buildSwitchTile(
            'Khuyến mãi',
            'Nhận thông báo về ưu đãi và khuyến mãi',
            _promotions,
            (value) => setState(() => _promotions = value),
          ),
          const Divider(),

          // Language Section
          _buildSectionHeader('Ngôn ngữ'),
          ListTile(
            leading: const Icon(Icons.language),
            title: const Text('Ngôn ngữ'),
            trailing: DropdownButton<String>(
              value: _language,
              underline: const SizedBox(),
              items: const [
                DropdownMenuItem(value: 'vi', child: Text('Tiếng Việt')),
                DropdownMenuItem(value: 'en', child: Text('English')),
              ],
              onChanged: (value) {
                if (value != null) {
                  setState(() => _language = value);
                }
              },
            ),
          ),
          const Divider(),

          // Privacy & Security Section
          _buildSectionHeader('Bảo mật & Riêng tư'),
          ListTile(
            leading: const Icon(Icons.lock),
            title: const Text('Đổi mật khẩu'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              // TODO: Navigate to change password screen
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Tính năng đang phát triển')),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.privacy_tip),
            title: const Text('Chính sách bảo mật'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              // TODO: Navigate to privacy policy
            },
          ),
          ListTile(
            leading: const Icon(Icons.description),
            title: const Text('Điều khoản sử dụng'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              // TODO: Navigate to terms of service
            },
          ),
          const Divider(),

          // App Info Section
          _buildSectionHeader('Thông tin ứng dụng'),
          ListTile(
            leading: const Icon(Icons.info),
            title: const Text('Phiên bản'),
            trailing: const Text('1.0.0'),
          ),
          ListTile(
            leading: const Icon(Icons.policy),
            title: const Text('Giấy phép mã nguồn'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              showLicensePage(context: context);
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

  Widget _buildSwitchTile(
    String title,
    String subtitle,
    bool value,
    ValueChanged<bool> onChanged,
  ) {
    return SwitchListTile(
      title: Text(title),
      subtitle: Text(subtitle),
      value: value,
      onChanged: onChanged,
      activeColor: AppColors.primary,
    );
  }
}
