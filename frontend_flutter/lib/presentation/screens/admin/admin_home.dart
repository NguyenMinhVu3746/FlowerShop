import 'package:flutter/material.dart';
import 'dashboard_screen.dart';
import 'products_screen.dart';
import 'orders_screen.dart';
import 'users_screen.dart';
import 'sales_screen.dart';
import 'admin_guard.dart';

class AdminHome extends StatefulWidget {
  const AdminHome({super.key});

  @override
  State<AdminHome> createState() => _AdminHomeState();
}

class _AdminHomeState extends State<AdminHome> {
  int _index = 0;

  final List<Widget> _screens = const [
    AdminDashboardScreen(),
    AdminProductsScreen(),
    AdminOrdersScreen(),
    AdminUsersScreen(),
    AdminSalesScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return AdminAuthGuard(
      child: Scaffold(
        appBar: AppBar(title: const Text('Admin')),
        body: IndexedStack(index: _index, children: _screens),
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _index,
          onTap: (i) => setState(() => _index = i),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard),
              label: 'Dashboard',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.inventory_2_outlined),
              label: 'Products',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.receipt_long_outlined),
              label: 'Orders',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.people_outline),
              label: 'Users',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.bar_chart),
              label: 'Sales',
            ),
          ],
        ),
      ),
    );
  }
}
