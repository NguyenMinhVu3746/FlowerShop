import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiConstants {
  // Compute base URL depending on platform:
  // - Android emulator -> 10.0.2.2
  // - Desktop (Windows/macOS/Linux) -> localhost
  // - Physical device -> replace with your machine IP (e.g., 192.168.x.x)
  // - Web -> use window origin (not available here) so default to '/api'

  static String get baseUrl {
    if (kIsWeb) {
      return '/api';
    }

    if (Platform.isAndroid) {
      return 'http://10.0.2.2:3000/api';
    }

    // For iOS simulator and desktop use localhost
    return 'http://127.0.0.1:3000/api';
  }

  static String get imageBaseUrl {
    if (kIsWeb) {
      return ''; // use relative paths on web
    }

    if (Platform.isAndroid) {
      return 'http://10.0.2.2:3000';
    }

    return 'http://127.0.0.1:3000';
  }

  // Auth endpoints
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';

  // Product endpoints
  static const String banners = '/home/banner';
  static const String categories = '/home/categories';
  static const String products = '/home/products';
  static const String search = '/search';
  static String productBySlug(String slug) => '/product/$slug';
  static String productReviews(String id) => '/product/$id/reviews';
  static String createReview(String id) => '/product/$id/review';

  // User endpoints
  static const String profile = '/user/profile';
  static const String addresses = '/user/address';
  static String updateAddress(String id) => '/user/address/$id';
  static String deleteAddress(String id) => '/user/address/$id';
  static const String orders = '/user/orders';
  static const String wishlist = '/user/wishlist';
  static const String toggleWishlist = '/user/wishlist/toggle';

  // Checkout endpoints
  static const String checkout = '/checkout';
  static const String aiSuggestMessage = '/checkout/ai-suggest-message';

  // AI endpoints
  static const String aiChat = '/ai/chat';
  static const String aiImageSearch = '/ai/image-search';

  // Upload endpoint
  static const String upload = '/upload';
}
