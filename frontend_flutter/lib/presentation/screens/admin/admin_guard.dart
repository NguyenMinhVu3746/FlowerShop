import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../auth/login_screen.dart';

class AdminAuthGuard extends StatelessWidget {
  final Widget child;
  const AdminAuthGuard({required this.child, super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    if (!auth.isAuthenticated) {
      return Scaffold(
        appBar: AppBar(title: const Text('Admin')),
        body: Center(
          child: ElevatedButton(
            onPressed: () async {
              final result = await Navigator.push<bool>(
                context,
                MaterialPageRoute(builder: (context) => const LoginScreen()),
              );
              if (result == true) {
                auth.loadUser();
              }
            },
            child: const Text('Đăng nhập để truy cập Admin'),
          ),
        ),
      );
    }

    final role = auth.user?.role ?? '';
    if (!(role == 'ADMIN' || role == 'SUPERADMIN')) {
      return Scaffold(
        appBar: AppBar(title: const Text('Admin')),
        body: const Center(
          child: Text('Bạn không có quyền truy cập trang quản trị.'),
        ),
      );
    }

    return child;
  }
}
