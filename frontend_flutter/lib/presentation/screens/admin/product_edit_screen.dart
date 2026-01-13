import 'package:flutter/material.dart';
import '../../../data/services/admin_service.dart';
import 'package:frontend_flutter/data/services/product_service.dart';

class AdminProductEditScreen extends StatefulWidget {
  final Map<String, dynamic>? product; // null = create
  const AdminProductEditScreen({this.product, super.key});

  @override
  State<AdminProductEditScreen> createState() => _AdminProductEditScreenState();
}

class _AdminProductEditScreenState extends State<AdminProductEditScreen> {
  final _formKey = GlobalKey<FormState>();
  final AdminService _adminService = AdminService();
  final ProductService _productService = ProductService();

  late TextEditingController _titleCtrl;
  late TextEditingController _imageCtrl;
  String? _categoryId;
  bool _loading = false;
  List<dynamic> _categories = [];

  @override
  void initState() {
    super.initState();
    _titleCtrl = TextEditingController(text: widget.product?['title'] ?? '');
    final images = widget.product?['images'] as List<dynamic>?;
    _imageCtrl = TextEditingController(
      text: images != null && images.isNotEmpty ? images[0] : '',
    );
    _categoryId = widget.product?['category']?['id'];
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    try {
      final cats = await _productService.getCategories();
      setState(() => _categories = cats);
    } catch (e) {
      // ignore
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);

    final payload = {
      'title': _titleCtrl.text.trim(),
      'images': [_imageCtrl.text.trim()],
      'categoryId': _categoryId,
    };

    try {
      if (widget.product == null) {
        await _adminService.createProduct(payload);
      } else {
        await _adminService.updateProduct(widget.product!['id'], payload);
      }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi: $e')));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.product == null ? 'Tạo sản phẩm' : 'Chỉnh sửa sản phẩm',
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _titleCtrl,
                decoration: const InputDecoration(labelText: 'Tiêu đề'),
                validator: (v) =>
                    v == null || v.trim().isEmpty ? 'Bắt buộc' : null,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _categoryId,
                items: (_categories as List)
                    .map<DropdownMenuItem<String>>(
                      (c) => DropdownMenuItem<String>(
                        value: (c as dynamic).id as String,
                        child: Text((c as dynamic).name as String),
                      ),
                    )
                    .toList(),
                onChanged: (v) => setState(() => _categoryId = v),
                decoration: const InputDecoration(labelText: 'Danh mục'),
                validator: (v) => v == null || v.isEmpty ? 'Bắt buộc' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _imageCtrl,
                decoration: const InputDecoration(
                  labelText: 'URL hình ảnh (1 ảnh)',
                ),
                validator: (v) =>
                    v == null || v.trim().isEmpty ? 'Bắt buộc' : null,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _loading ? null : _save,
                child: _loading
                    ? const CircularProgressIndicator()
                    : const Text('Lưu'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
