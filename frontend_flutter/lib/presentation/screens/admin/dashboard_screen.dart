import 'package:flutter/material.dart';
import '../../../data/services/admin_service.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  final AdminService _adminService = AdminService();
  Map<String, dynamic>? _overview;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadOverview();
  }

  Future<void> _loadOverview() async {
    try {
      final data = await _adminService.getOverview();
      setState(() {
        _overview = data['statistics'] ?? data;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_overview == null) {
      return const Center(child: Text('Không lấy được dữ liệu'));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Thống kê', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              _statCard(
                'Tổng đơn',
                _overview!['totalOrders']?.toString() ?? '0',
              ),
              _statCard(
                'Doanh thu',
                _overview!['totalRevenue']?.toString() ?? '0',
              ),
              _statCard(
                'Sản phẩm',
                _overview!['totalProducts']?.toString() ?? '0',
              ),
              _statCard(
                'Người dùng',
                _overview!['totalUsers']?.toString() ?? '0',
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text('Đơn gần nhất', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          ...((_overview!['recentOrders'] as List<dynamic>? ?? [])).map(
            (o) => Card(
              child: ListTile(
                title: Text('Đơn ${o['id'] ?? ''}'),
                subtitle: Text(
                  o['receiver']?['name'] ?? o['user']?['fullname'] ?? '',
                ),
                trailing: Text(o['status'] ?? ''),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _statCard(String title, String value) {
    return SizedBox(
      width: 160,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
              const SizedBox(height: 8),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
