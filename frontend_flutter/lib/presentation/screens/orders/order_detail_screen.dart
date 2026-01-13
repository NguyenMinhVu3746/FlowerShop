import 'package:flutter/material.dart';
import '../../../data/models/order_model.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/app_utils.dart';

class OrderDetailScreen extends StatelessWidget {
  final Order order;

  const OrderDetailScreen({super.key, required this.order});

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PENDING':
        return AppColors.warning;
      case 'CONFIRMED':
      case 'PREPARING':
        return AppColors.info;
      case 'DELIVERING':
        return Colors.purple;
      case 'COMPLETED':
        return AppColors.success;
      case 'CANCELLED':
        return AppColors.error;
      default:
        return AppColors.textSecondary;
    }
  }

  String _getStatusLabel(String status) {
    switch (status) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'PREPARING':
        return 'Đang chuẩn bị';
      case 'DELIVERING':
        return 'Đang giao';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  String _formatDeliveryDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return AppUtils.formatDate(date);
    } catch (e) {
      return dateStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Đơn hàng #${order.id.substring(0, 8).toUpperCase()}'),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              color: _getStatusColor(order.status).withOpacity(0.1),
              child: Row(
                children: [
                  Icon(
                    order.status == 'COMPLETED'
                        ? Icons.check_circle
                        : order.status == 'CANCELLED'
                            ? Icons.cancel
                            : Icons.access_time,
                    color: _getStatusColor(order.status),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _getStatusLabel(order.status),
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: _getStatusColor(order.status),
                          ),
                        ),
                        Text(
                          'Đặt ngày ${AppUtils.formatDateTime(DateTime.parse(order.createdAt))}',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Receiver info
            _buildSection(
              'Thông tin người nhận',
              Icons.location_on,
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    order.receiver.name,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(order.receiver.phone),
                  const SizedBox(height: 4),
                  Text(order.receiver.address),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.calendar_today, size: 16, color: AppColors.textSecondary),
                      const SizedBox(width: 4),
                      Text(
                        'Giao: ${_formatDeliveryDate(order.receiver.deliveryDate)} (${order.receiver.deliverySlot})',
                        style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Items
            _buildSection(
              'Sản phẩm (${order.items.length})',
              Icons.shopping_bag,
              Column(
                children: order.items.map((item) {
                  final productTitle = item.variant.product?.title ?? 'Sản phẩm';
                  final productImage = item.variant.product?.images.isNotEmpty == true 
                      ? item.variant.product!.images.first 
                      : '';
                  
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: productImage.isNotEmpty
                              ? Image.network(
                                  AppUtils.getImageUrl(productImage),
                                  width: 60,
                                  height: 60,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Container(
                                    width: 60,
                                    height: 60,
                                    color: Colors.grey[300],
                                    child: const Icon(Icons.image),
                                  ),
                                )
                              : Container(
                                  width: 60,
                                  height: 60,
                                  color: Colors.grey[300],
                                  child: const Icon(Icons.image),
                                ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                productTitle,
                                style: const TextStyle(fontWeight: FontWeight.w600),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Size: ${item.variant.size}',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    AppUtils.formatPrice(item.price),
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                  Text(
                                    'x${item.quantity}',
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),

            // Message card
            if (order.messageCard != null && order.messageCard!.isNotEmpty)
              _buildSection(
                'Thiệp chúc mừng',
                Icons.card_giftcard,
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.pink.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.pink.shade200),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        order.messageCard!,
                        style: const TextStyle(
                          fontSize: 14,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        order.senderType == 'NAMED' ? '- Người gửi' : '- Ẩn danh',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

            // Note
            if (order.note != null && order.note!.isNotEmpty)
              _buildSection(
                'Ghi chú',
                Icons.note,
                Text(order.note!),
              ),

            // Payment
            _buildSection(
              'Thanh toán',
              Icons.payment,
              Column(
                children: [
                  _buildPaymentRow('Phương thức', _getPaymentMethodLabel(order.payment.method)),
                  _buildPaymentRow('Trạng thái', _getPaymentStatusLabel(order.payment.status)),
                  const Divider(height: 24),
                  _buildPaymentRow('Tổng tiền', AppUtils.formatPrice(order.total), isTotal: true),
                ],
              ),
            ),

            const SizedBox(height: 80),
          ],
        ),
      ),
      bottomNavigationBar: order.status == 'PENDING'
          ? Container(
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
                child: ElevatedButton(
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('Hủy đơn hàng'),
                        content: const Text(
                          'Vui lòng liên hệ nhân viên để hủy đơn hàng.\n\nHotline: 1900 xxxx\nEmail: support@hoashop.com',
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text('Đóng'),
                          ),
                        ],
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.error,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('Hủy đơn hàng'),
                ),
              ),
            )
          : null,
    );
  }

  Widget _buildSection(String title, IconData icon, Widget content) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          content,
        ],
      ),
    );
  }

  Widget _buildPaymentRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isTotal ? 16 : 14,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              color: isTotal ? Colors.black : AppColors.textSecondary,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: isTotal ? 18 : 14,
              fontWeight: FontWeight.bold,
              color: isTotal ? AppColors.primary : Colors.black,
            ),
          ),
        ],
      ),
    );
  }

  String _getPaymentMethodLabel(String method) {
    switch (method) {
      case 'COD':
        return 'Thanh toán khi nhận hàng';
      case 'BANK_TRANSFER':
        return 'Chuyển khoản';
      case 'MOMO':
        return 'Ví MoMo';
      case 'VNPAY':
        return 'VNPAY';
      default:
        return method;
    }
  }

  String _getPaymentStatusLabel(String status) {
    switch (status) {
      case 'PENDING':
        return 'Chờ thanh toán';
      case 'PAID':
        return 'Đã thanh toán';
      case 'FAILED':
        return 'Thất bại';
      default:
        return status;
    }
  }
}
