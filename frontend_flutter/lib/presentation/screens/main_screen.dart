import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/cart_provider.dart';
import '../../providers/auth_provider.dart';
import '../../core/constants/app_colors.dart';
import 'home/home_screen.dart';
import 'categories/categories_screen.dart';
import 'cart/cart_screen.dart';
import 'ai/ai_chat_screen.dart';
import 'profile/profile_screen.dart';
import 'ai/ai_scan_screen.dart'; // Import màn hình AI Scan

class MainScreen extends StatefulWidget {
  final int initialIndex;

  const MainScreen({super.key, this.initialIndex = 0});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  void _navigateToTab(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      HomeScreen(onNavigateToTab: _navigateToTab),
      const CategoriesScreen(),
      const CartScreen(),
      const AIChatScreen(key: ValueKey('ai_chat')),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: screens),
      
      // --- PHẦN THÊM MỚI: NÚT SCAN HOA ---
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Chuyển hướng sang màn hình Scan Hoa
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const AiScanScreen()),
          );
        },
        backgroundColor: const Color(0xFFB71C1C), // Màu đỏ đậm nổi bật
        elevation: 4.0, // Đổ bóng cho đẹp
        child: const Icon(Icons.camera_alt, color: Colors.white),
      ),
      // Đặt vị trí nút nổi lên trên thanh menu (mặc định là góc phải)
      // Nếu bạn muốn nút nằm giữa, có thể thử: FloatingActionButtonLocation.centerFloat
      // ------------------------------------

      bottomNavigationBar: Consumer<CartProvider>(
        builder: (context, cart, child) {
          return BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (index) {
              setState(() {
                _currentIndex = index;
              });
              // Refresh profile when switching to profile tab
              if (index == 4) {
                print(
                  '📱 MainScreen: Switching to Profile tab, calling loadUser()',
                );
                context.read<AuthProvider>().loadUser();
              }
            },
            type: BottomNavigationBarType.fixed,
            selectedItemColor: AppColors.primary,
            unselectedItemColor: AppColors.textTertiary,
            selectedFontSize: 12,
            unselectedFontSize: 12,
            items: [
              const BottomNavigationBarItem(
                icon: Icon(Icons.home_outlined),
                activeIcon: Icon(Icons.home),
                label: 'Trang chủ',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.category_outlined),
                activeIcon: Icon(Icons.category),
                label: 'Danh mục',
              ),
              BottomNavigationBarItem(
                icon: _buildCartIcon(cart.itemCount),
                activeIcon: _buildCartIcon(cart.itemCount, isActive: true),
                label: 'Giỏ hàng',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.chat_bubble_outline),
                activeIcon: Icon(Icons.chat_bubble),
                label: 'AI Tư vấn',
              ),
              const BottomNavigationBarItem(
                icon: Icon(Icons.person_outline),
                activeIcon: Icon(Icons.person),
                label: 'Tài khoản',
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildCartIcon(int itemCount, {bool isActive = false}) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Icon(isActive ? Icons.shopping_cart : Icons.shopping_cart_outlined),
        if (itemCount > 0)
          Positioned(
            right: -6,
            top: -6,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                color: AppColors.error,
                shape: BoxShape.circle,
              ),
              constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
              child: Text(
                itemCount > 99 ? '99+' : '$itemCount',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
      ],
    );
  }
}