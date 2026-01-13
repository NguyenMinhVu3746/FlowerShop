import 'package:flutter/material.dart';
import '../../../data/services/admin_service.dart';

class AdminUsersScreen extends StatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  State<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends State<AdminUsersScreen> {
  final AdminService _adminService = AdminService();
  List<dynamic> _users = [];
  bool _loading = true;
  String? _processingUserId;

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    setState(() => _loading = true);
    try {
      final resp = await _adminService.getUsers(page: 1, limit: 50);
      setState(() {
        _users = resp['users'] as List<dynamic>? ?? [];
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Lỗi khi tải người dùng')));
    }
  }

  Future<void> _deleteUser(String id) async {
    setState(() => _processingUserId = id);
    try {
      await _adminService.deleteUser(id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Xóa người dùng thành công')),
      );
      await _loadUsers();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Lỗi khi xóa người dùng')));
    } finally {
      if (!mounted) return;
      setState(() => _processingUserId = null);
    }
  }

  Future<void> _toggleRole(String id, String currentRole) async {
    setState(() => _processingUserId = id);
    try {
      final newRole = currentRole == 'ADMIN' ? 'USER' : 'ADMIN';
      await _adminService.updateUserRole(id, newRole);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cập nhật vai trò thành công')),
      );
      await _loadUsers();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Lỗi khi cập nhật vai trò')));
    } finally {
      if (!mounted) return;
      setState(() => _processingUserId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_users.isEmpty) return const Center(child: Text('Không có người dùng'));
    return RefreshIndicator(
      onRefresh: _loadUsers,
      child: ListView.separated(
        padding: const EdgeInsets.all(12),
        itemCount: _users.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (context, index) {
          final u = _users[index];
          final id = u['id']?.toString() ?? '';
          final role = u['role']?.toString() ?? 'USER';
          final processing = _processingUserId == id;
          return Card(
            child: ListTile(
              title: Text(u['fullname'] ?? ''),
              subtitle: Text(u['email'] ?? ''),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ElevatedButton(
                    onPressed: processing ? null : () => _toggleRole(id, role),
                    child: processing
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Text(
                            role == 'ADMIN' ? 'Thu hồi quyền' : 'Đặt làm admin',
                          ),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton(
                    onPressed: processing ? null : () => _confirmDelete(id),
                    child: const Text('Xóa'),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _confirmDelete(String id) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xác nhận'),
        content: const Text('Bạn có chắc muốn xóa người dùng này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Hủy'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _deleteUser(id);
            },
            child: const Text('Xóa', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
