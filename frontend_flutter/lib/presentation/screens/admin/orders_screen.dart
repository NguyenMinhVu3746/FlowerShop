import 'package:flutter/material.dart';
import '../../../data/services/admin_service.dart';
import '../../../data/models/order_model.dart';
import '../orders/order_detail_screen.dart';
import '../../../core/utils/app_utils.dart';

class AdminOrdersScreen extends StatefulWidget {
  const AdminOrdersScreen({super.key});

  @override
  State<AdminOrdersScreen> createState() => _AdminOrdersScreenState();
}

class _AdminOrdersScreenState extends State<AdminOrdersScreen> {
  final AdminService _adminService = AdminService();
  List<dynamic> _orders = [];
  bool _loading = true;
  String? _updatingOrderId;

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    try {
      final resp = await _adminService.getOrders(page: 1, limit: 50);
      setState(() {
        _orders = resp['orders'] as List<dynamic>? ?? [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  List<Map<String, String>> _actionsForStatus(String? status) {
    if (status == null) return [];
    switch (status) {
      case 'PENDING':
        return [
          {'label': 'Xác nhận', 'status': 'CONFIRMED'},
          {'label': 'Hủy', 'status': 'CANCELLED'},
        ];
      case 'CONFIRMED':
        return [
          {'label': 'Chuẩn bị', 'status': 'PREPARING'},
          {'label': 'Hủy', 'status': 'CANCELLED'},
        ];
      case 'PREPARING':
        return [
          {'label': 'Giao hàng', 'status': 'DELIVERING'},
        ];
      case 'DELIVERING':
        return [
          {'label': 'Hoàn thành', 'status': 'COMPLETED'},
        ];
      default:
        return [];
    }
  }

  Future<void> _updateStatus(String id, String status) async {
    setState(() => _updatingOrderId = id);
    try {
      await _adminService.updateOrderStatus(id, status);
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Cập nhật trạng thái thành công')));
      await _loadOrders();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi khi cập nhật trạng thái')));
    } finally {
      if (!mounted) return;
      setState(() => _updatingOrderId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemCount: _orders.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final o = _orders[index];
        final status = o['status'] as String?;
        final actions = _actionsForStatus(status);
        final isUpdating = _updatingOrderId == (o['id']?.toString() ?? '');
        // try to parse into Order model for richer UI, fallback to raw map
        Order? orderObj;
        try {
          orderObj = Order.fromJson(o as Map<String, dynamic>);
        } catch (_) {
          orderObj = null;
        }

        return Card(
          child: ExpansionTile(
            tilePadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 8,
            ),
            title: Text('Đơn ${o['id'] ?? ''}'),
            subtitle: Text(
              orderObj?.receiver.name ?? (o['user']?['fullname'] ?? ''),
            ),
            childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            children: [
              // Status
              Padding(
                padding: const EdgeInsets.only(top: 8, bottom: 8),
                child: Text('Trạng thái: ${status ?? ''}'),
              ),

              // Receiver & contact
              if (orderObj != null)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Người nhận: ${orderObj.receiver.name}'),
                    const SizedBox(height: 4),
                    Text('SĐT: ${orderObj.receiver.phone}'),
                    const SizedBox(height: 4),
                    Text('Địa chỉ: ${orderObj.receiver.address}'),
                    const SizedBox(height: 8),
                  ],
                ),

              // Items summary (limit to 3)
              if (orderObj != null)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Sản phẩm (${orderObj.items.length})',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 8),
                    ...orderObj.items.take(3).map((item) {
                      final title = item.variant.product?.title ?? 'Sản phẩm';
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                title,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text('x${item.quantity}'),
                            const SizedBox(width: 8),
                            Text(AppUtils.formatPrice(item.price)),
                          ],
                        ),
                      );
                    }).toList(),
                    if (orderObj.items.length > 3)
                      Padding(
                        padding: const EdgeInsets.only(top: 4, bottom: 8),
                        child: Text(
                          '... và ${orderObj.items.length - 3} sản phẩm khác',
                          style: TextStyle(color: Colors.grey[600]),
                        ),
                      ),
                  ],
                ),

              // Total and actions row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (orderObj != null)
                    Text(
                      'Tổng: ${AppUtils.formatPrice(orderObj.total)}',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  Row(
                    children: [
                      TextButton(
                        onPressed: () {
                          if (orderObj == null) return;
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) =>
                                  OrderDetailScreen(order: orderObj!),
                            ),
                          );
                        },
                        child: const Text('Chi tiết'),
                      ),
                      const SizedBox(width: 8),
                      // status action buttons
                      ...actions.map((a) {
                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              minimumSize: const Size(0, 36),
                            ),
                            onPressed: isUpdating
                                ? null
                                : () async {
                                    final id = o['id']?.toString() ?? '';
                                    await _updateStatus(id, a['status']!);
                                  },
                            child: isUpdating
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  )
                                : Text(a['label']!),
                          ),
                        );
                      }).toList(),
                    ],
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
