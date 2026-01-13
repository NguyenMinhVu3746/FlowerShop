import 'package:flutter/material.dart';
import '../../../data/services/admin_service.dart';
import 'product_edit_screen.dart';

class AdminProductsScreen extends StatefulWidget {
  const AdminProductsScreen({super.key});

  @override
  State<AdminProductsScreen> createState() => _AdminProductsScreenState();
}

class _AdminProductsScreenState extends State<AdminProductsScreen> {
  final AdminService _adminService = AdminService();
  List<dynamic> _products = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    try {
      final data = await _adminService.getProducts();
      setState(() {
        _products = data;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemCount: _products.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final p = _products[index];
        return Card(
          child: ListTile(
            title: Text(p['name'] ?? p['title'] ?? '—'),
            subtitle: Text(p['slug'] ?? ''),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.edit),
                  onPressed: () async {
                    final result = await Navigator.push<bool>(
                      context,
                      MaterialPageRoute(
                        builder: (context) =>
                            AdminProductEditScreen(product: p),
                      ),
                    );
                    if (result == true) _loadProducts();
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.delete, color: Colors.red),
                  onPressed: () async {
                    final ok = await showDialog<bool>(
                      context: context,
                      builder: (c) => AlertDialog(
                        title: const Text('Xác nhận'),
                        content: const Text(
                          'Bạn có chắc muốn xóa sản phẩm này?',
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(c, false),
                            child: const Text('Hủy'),
                          ),
                          TextButton(
                            onPressed: () => Navigator.pop(c, true),
                            child: const Text('Xóa'),
                          ),
                        ],
                      ),
                    );
                    if (ok == true) {
                      try {
                        await _adminService.deleteProduct(p['id']);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Xóa thành công')),
                        );
                        _loadProducts();
                      } catch (e) {
                        ScaffoldMessenger.of(
                          context,
                        ).showSnackBar(SnackBar(content: Text('Lỗi: $e')));
                      }
                    }
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
