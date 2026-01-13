import 'package:flutter/material.dart';
import '../../../data/services/user_service.dart';
import '../../../data/models/user_model.dart';
import '../../../core/constants/app_colors.dart';

class AddressesScreen extends StatefulWidget {
  const AddressesScreen({super.key});

  @override
  State<AddressesScreen> createState() => _AddressesScreenState();
}

class _AddressesScreenState extends State<AddressesScreen> {
  final UserService _userService = UserService();
  List<Address> _addresses = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadAddresses();
  }

  Future<void> _loadAddresses() async {
    setState(() => _isLoading = true);

    try {
      final addresses = await _userService.getAddresses();
      setState(() {
        _addresses = addresses;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi: $e')),
        );
      }
    }
  }

  Future<void> _deleteAddress(String addressId) async {
    try {
      await _userService.deleteAddress(addressId);
      _loadAddresses();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã xóa địa chỉ')),
        );
      }
    } catch (e) {
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
        title: const Text('Địa chỉ của tôi'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showAddressDialog(),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _addresses.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.location_off_outlined,
                        size: 80,
                        color: AppColors.textTertiary,
                      ),
                      const SizedBox(height: 16),
                      const Text('Chưa có địa chỉ nào'),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: () => _showAddressDialog(),
                        icon: const Icon(Icons.add),
                        label: const Text('Thêm địa chỉ'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadAddresses,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _addresses.length,
                    itemBuilder: (context, index) {
                      return _buildAddressCard(_addresses[index]);
                    },
                  ),
                ),
    );
  }

  Widget _buildAddressCard(Address address) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.secondary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          address.title,
                          style: const TextStyle(
                            color: AppColors.secondary,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          address.nameReceiver,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                if (address.isDefault)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'Mặc định',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              address.phoneReceiver,
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              address.fullAddress,
              style: const TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 2),
            Text(
              '${address.ward}, ${address.district}, ${address.province}',
              style: TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
            ),
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton.icon(
                  onPressed: () => _showAddressDialog(address: address),
                  icon: const Icon(Icons.edit, size: 18),
                  label: const Text('Sửa'),
                ),
                TextButton.icon(
                  onPressed: () => _confirmDelete(address),
                  icon: Icon(Icons.delete, size: 18, color: AppColors.error),
                  label: Text('Xóa', style: TextStyle(color: AppColors.error)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDelete(Address address) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xác nhận xóa'),
        content: const Text('Bạn có chắc muốn xóa địa chỉ này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _deleteAddress(address.id);
            },
            child: Text('Xóa', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }

  void _showAddressDialog({Address? address}) {
    final isEdit = address != null;
    final titleController = TextEditingController(text: address?.title ?? 'Nhà');
    final nameController = TextEditingController(text: address?.nameReceiver ?? '');
    final phoneController = TextEditingController(text: address?.phoneReceiver ?? '');
    final addressController = TextEditingController(text: address?.fullAddress ?? '');
    final wardController = TextEditingController(text: address?.ward ?? '');
    final districtController = TextEditingController(text: address?.district ?? '');
    final provinceController = TextEditingController(text: address?.province ?? '');
    bool isDefault = address?.isDefault ?? false;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: Text(isEdit ? 'Sửa địa chỉ' : 'Thêm địa chỉ'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(
                    labelText: 'Tiêu đề (Nhà, Văn phòng...)',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'Tên người nhận',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: phoneController,
                  decoration: const InputDecoration(
                    labelText: 'Số điện thoại',
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.phone,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: addressController,
                  decoration: const InputDecoration(
                    labelText: 'Địa chỉ cụ thể',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 2,
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: wardController,
                        decoration: const InputDecoration(
                          labelText: 'Phường/Xã',
                          border: OutlineInputBorder(),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: districtController,
                  decoration: const InputDecoration(
                    labelText: 'Quận/Huyện',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: provinceController,
                  decoration: const InputDecoration(
                    labelText: 'Tỉnh/Thành phố',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                CheckboxListTile(
                  title: const Text('Đặt làm địa chỉ mặc định'),
                  value: isDefault,
                  onChanged: (value) {
                    setState(() => isDefault = value ?? false);
                  },
                  contentPadding: EdgeInsets.zero,
                  controlAffinity: ListTileControlAffinity.leading,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Hủy'),
            ),
            ElevatedButton(
              onPressed: () async {
                final title = titleController.text.trim();
                final name = nameController.text.trim();
                final phone = phoneController.text.trim();
                final fullAddress = addressController.text.trim();
                final ward = wardController.text.trim();
                final district = districtController.text.trim();
                final province = provinceController.text.trim();

                if (title.isEmpty || name.isEmpty || phone.isEmpty || 
                    fullAddress.isEmpty || ward.isEmpty || 
                    district.isEmpty || province.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Vui lòng điền đầy đủ thông tin')),
                  );
                  return;
                }

                final addressData = {
                  'title': title,
                  'nameReceiver': name,
                  'phoneReceiver': phone,
                  'fullAddress': fullAddress,
                  'ward': ward,
                  'district': district,
                  'province': province,
                  'isDefault': isDefault,
                };

                try {
                  if (isEdit) {
                    await _userService.updateAddress(address.id, addressData);
                  } else {
                    await _userService.addAddress(addressData);
                  }

                  Navigator.pop(context);
                  _loadAddresses();
                  if (this.context.mounted) {
                    ScaffoldMessenger.of(this.context).showSnackBar(
                      SnackBar(content: Text(isEdit ? 'Đã cập nhật địa chỉ' : 'Đã thêm địa chỉ')),
                    );
                  }
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Lỗi: $e')),
                  );
                }
              },
              child: Text(isEdit ? 'Cập nhật' : 'Thêm'),
            ),
          ],
        ),
      ),
    );
  }
}
