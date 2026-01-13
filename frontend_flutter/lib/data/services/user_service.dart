import 'dart:io';
import '../models/user_model.dart';
import '../models/order_model.dart';
import '../models/product_model.dart';
import '../../core/constants/api_constants.dart';
import 'api_client.dart';
import 'upload_service.dart';

class UserService {
  final ApiClient _apiClient = ApiClient();
  final UploadService _uploadService = UploadService();

  Future<User> getProfile() async {
    try {
      final response = await _apiClient.get(ApiConstants.profile);
      if (response.data['success']) {
        return User.fromJson(response.data['data']);
      }
      throw Exception('Không thể lấy thông tin người dùng');
    } catch (e) {
      rethrow;
    }
  }

  Future<User> updateProfile({
    String? fullname,
    String? phone,
    String? birthday,
    String? gender,
    File? avatarFile,
  }) async {
    try {
      final data = <String, dynamic>{};

      if (fullname != null) data['fullname'] = fullname;
      if (phone != null) data['phone'] = phone;
      if (birthday != null) data['birthday'] = birthday;
      if (gender != null) data['gender'] = gender;

      // Upload avatar if provided
      if (avatarFile != null) {
        final avatarUrl = await _uploadService.uploadImage(avatarFile);
        data['avatar'] = avatarUrl;
      }

      final response = await _apiClient.patch(ApiConstants.profile, data: data);
      if (response.data['success']) {
        return User.fromJson(response.data['data']);
      }
      throw Exception('Cập nhật thất bại');
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Address>> getAddresses() async {
    try {
      final response = await _apiClient.get(ApiConstants.addresses);
      if (response.data['success']) {
        final addresses = response.data['data']['addresses'] ?? [];
        return (addresses as List).map((a) => Address.fromJson(a)).toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  Future<Address> addAddress(Map<String, dynamic> addressData) async {
    try {
      final response = await _apiClient.post(
        ApiConstants.addresses,
        data: addressData,
      );
      if (response.data['success']) {
        return Address.fromJson(response.data['data']['address']);
      }
      throw Exception('Thêm địa chỉ thất bại');
    } catch (e) {
      rethrow;
    }
  }

  Future<Address> updateAddress(
    String id,
    Map<String, dynamic> addressData,
  ) async {
    try {
      final response = await _apiClient.patch(
        ApiConstants.updateAddress(id),
        data: addressData,
      );
      if (response.data['success']) {
        return Address.fromJson(response.data['data']['address']);
      }
      throw Exception('Cập nhật địa chỉ thất bại');
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteAddress(String id) async {
    try {
      await _apiClient.delete(ApiConstants.deleteAddress(id));
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getOrders({
    String? status,
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final params = <String, dynamic>{'page': page, 'limit': limit};
      if (status != null) params['status'] = status;

      final response = await _apiClient.get(
        ApiConstants.orders,
        queryParameters: params,
      );

      if (response.data['success']) {
        final data = response.data['data'];
        return {
          'orders': (data['orders'] as List)
              .map((o) => Order.fromJson(o))
              .toList(),
          'total': data['total'],
        };
      }
      return {'orders': <Order>[], 'total': 0};
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Product>> getWishlist() async {
    try {
      final response = await _apiClient.get(ApiConstants.wishlist);
      if (response.data['success']) {
        // Backend returns array of wishlist items with nested product
        final wishlistItems = response.data['data'] ?? [];
        return (wishlistItems as List)
            .map((item) => Product.fromJson(item['product']))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  Future<bool> toggleWishlist(String productId) async {
    try {
      final response = await _apiClient.post(
        ApiConstants.toggleWishlist,
        data: {'productId': productId},
      );
      if (response.data['success']) {
        return response.data['data']['inWishlist'] ?? false;
      }
      return false;
    } catch (e) {
      rethrow;
    }
  }
}
