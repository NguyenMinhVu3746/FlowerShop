import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../presentation/screens/auth/login_screen.dart';

class AuthUtils {
  /// Check if user is authenticated
  /// If not, show login screen and return false
  /// If yes, return true to continue
  static bool requireAuth(BuildContext context, {String? message}) {
    final authProvider = context.read<AuthProvider>();
    
    if (!authProvider.isAuthenticated) {
      // Show login screen
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (context) => LoginScreen(
            message: message ?? 'Vui lòng đăng nhập để tiếp tục',
          ),
        ),
      );
      return false;
    }
    
    return true;
  }

  /// Show login dialog and return true if user logged in successfully
  static Future<bool> showLoginDialog(BuildContext context, {String? message}) async {
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (context) => LoginScreen(
          message: message ?? 'Vui lòng đăng nhập để tiếp tục',
        ),
      ),
    );
    
    return result ?? false;
  }
}
