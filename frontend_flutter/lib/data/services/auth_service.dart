import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../../core/constants/api_constants.dart';
import 'api_client.dart';

class AuthService {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String fullname,
    required String phone,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiConstants.register,
        data: {
          'email': email,
          'password': password,
          'fullname': fullname,
          'phone': phone,
        },
      );

      print('📤 Register response status: ${response.statusCode}');
      print('📤 Register response data: ${response.data}');

      // Check if response is successful
      if (response.statusCode == 200 || response.statusCode == 201) {
        if (response.data['success'] == true) {
          // Don't save tokens - require manual login after registration
          return response.data;
        }
      }
      
      // Handle error response from API
      final errorMessage = response.data['error'] ?? 
                          response.data['message'] ?? 
                          'Đăng ký thất bại';
      throw Exception(errorMessage);
    } on DioException catch (e) {
      // Handle Dio specific errors
      if (e.response?.data != null) {
        final errorMessage = e.response?.data['error'] ?? 
                            e.response?.data['message'] ?? 
                            'Đăng ký thất bại';
        throw Exception(errorMessage);
      }
      throw Exception('Lỗi kết nối: ${e.message}');
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _apiClient.post(
        ApiConstants.login,
        data: {'email': email, 'password': password},
      );

      // Check if response is successful
      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data['data'];
        await _saveAuthData(
          accessToken: data['accessToken'],
          refreshToken: data['refreshToken'],
          user: User.fromJson(data['user']),
        );
        return response.data;
      }
      
      // Handle error response from API
      final errorMessage = response.data['error'] ?? 
                          response.data['message'] ?? 
                          'Đăng nhập thất bại';
      throw Exception(errorMessage);
    } on DioException catch (e) {
      // Handle Dio specific errors
      if (e.response?.data != null) {
        final errorMessage = e.response?.data['error'] ?? 
                            e.response?.data['message'] ?? 
                            'Đăng nhập thất bại';
        throw Exception(errorMessage);
      }
      throw Exception('Lỗi kết nối: ${e.message}');
    } catch (e) {
      rethrow;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('accessToken');
    await prefs.remove('refreshToken');
    await prefs.remove('user');
  }

  Future<User?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('user');
    if (userJson != null) {
      return User.fromJson(json.decode(userJson));
    }
    return null;
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('accessToken') != null;
  }

  Future<void> _saveAuthData({
    required String accessToken,
    required String refreshToken,
    required User user,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('accessToken', accessToken);
    await prefs.setString('refreshToken', refreshToken);
    await prefs.setString('user', json.encode(user.toJson()));
  }

  Future<void> updateLocalUser(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user', json.encode(user.toJson()));
  }

  Future<void> forgotPassword(String email) async {
    try {
      await _apiClient.post(
        ApiConstants.forgotPassword,
        data: {'email': email},
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> resetPassword(String token, String password) async {
    try {
      await _apiClient.post(
        ApiConstants.resetPassword,
        data: {'token': token, 'password': password},
      );
    } catch (e) {
      rethrow;
    }
  }
}
