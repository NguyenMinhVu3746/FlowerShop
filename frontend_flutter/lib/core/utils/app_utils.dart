import 'package:intl/intl.dart';
import '../constants/api_constants.dart';

class AppUtils {
  // Get full image URL
  static String getImageUrl(String path) {
    if (path.startsWith('http')) {
      return path;
    }
    // Remove leading slash if exists
    final cleanPath = path.startsWith('/') ? path : '/$path';
    return '${ApiConstants.imageBaseUrl}$cleanPath';
  }

  // Format price to Vietnamese currency
  static String formatPrice(double price) {
    return NumberFormat.currency(
      locale: 'vi',
      symbol: '₫',
      decimalDigits: 0,
    ).format(price);
  }

  // Alias for formatPrice
  static String formatCurrency(double amount) {
    return formatPrice(amount);
  }

  // Format date time
  static String formatDateTime(DateTime dateTime) {
    return DateFormat('dd/MM/yyyy HH:mm').format(dateTime);
  }

  // Format date only
  static String formatDate(DateTime dateTime) {
    return DateFormat('dd/MM/yyyy').format(dateTime);
  }

  // Validate email
  static bool isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }

  // Validate phone number (Vietnam)
  static bool isValidPhone(String phone) {
    return RegExp(r'^(0|\+84)[0-9]{9}$').hasMatch(phone);
  }
}
