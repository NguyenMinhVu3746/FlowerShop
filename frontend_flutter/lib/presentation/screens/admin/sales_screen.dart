import 'package:flutter/material.dart';
import '../../../data/services/admin_service.dart';

class AdminSalesScreen extends StatefulWidget {
  const AdminSalesScreen({super.key});

  @override
  State<AdminSalesScreen> createState() => _AdminSalesScreenState();
}

class _AdminSalesScreenState extends State<AdminSalesScreen> {
  final AdminService _adminService = AdminService();
  bool _loading = true;
  Map<String, dynamic>? _overview;
  List<dynamic> _chartData = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final ov = await _adminService.getOverview();
      final chart = await _adminService.getRevenueChart(days: 30);
      setState(() {
        _overview = ov;
        _chartData = chart['chartData'] as List<dynamic>? ?? [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Lỗi khi tải thống kê')));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Tổng doanh thu: ${_overview?['totalRevenue'] ?? _overview?['revenueSum'] ?? 0}',
          ),
          const SizedBox(height: 12),
          Text(
            'Đơn hoàn thành: ${_overview?['completedOrders'] ?? _overview?['completed'] ?? 0}',
          ),
          const SizedBox(height: 12),
          Text(
            'Người dùng: ${_overview?['totalUsers'] ?? _overview?['users'] ?? 0}',
          ),
          const SizedBox(height: 20),
          const Text(
            'Doanh thu theo ngày (30 ngày gần nhất):',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          if (_chartData.isEmpty) const Text('Không có dữ liệu'),
          if (_chartData.isNotEmpty)
            Column(
              children: _chartData.map((d) {
                return ListTile(
                  dense: true,
                  title: Text(d['date'] ?? ''),
                  trailing: Text((d['revenue'] ?? 0).toString()),
                );
              }).toList(),
            ),
        ],
      ),
    );
  }
}
