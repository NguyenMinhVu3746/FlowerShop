import 'package:dio/dio.dart';
import 'api_client.dart';

class AdminService {
  final ApiClient _client = ApiClient();

  Future<Map<String, dynamic>> getOverview() async {
    final Response res = await _client.get('/admin/dashboard/overview');
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<List<dynamic>> getRecentOrders() async {
    final Response res = await _client.get('/admin/orders');
    final data = res.data['data'] as Map<String, dynamic>;
    return data['orders'] as List<dynamic>;
  }

  Future<Map<String, dynamic>> getOrders({
    int page = 1,
    int limit = 20,
    String? status,
  }) async {
    final params = <String, dynamic>{'page': page, 'limit': limit};
    if (status != null) params['status'] = status;
    final Response res = await _client.get(
      '/admin/orders',
      queryParameters: params,
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<List<dynamic>> getProducts({int page = 1}) async {
    final Response res = await _client.get(
      '/admin/product',
      queryParameters: {'page': page},
    );
    return res.data['data'] as List<dynamic>;
  }

  Future<void> deleteProduct(String id) async {
    await _client.delete('/admin/product/$id');
  }

  Future<Map<String, dynamic>> createProduct(Map<String, dynamic> data) async {
    final Response res = await _client.post('/admin/product', data: data);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateProduct(
    String id,
    Map<String, dynamic> data,
  ) async {
    final Response res = await _client.patch('/admin/product/$id', data: data);
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateOrderStatus(
    String id,
    String status,
  ) async {
    final Response res = await _client.patch(
      '/admin/order/$id/status',
      data: {'status': status},
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getUsers({int page = 1, int limit = 20}) async {
    final params = {'page': page, 'limit': limit};
    final Response res = await _client.get(
      '/admin/users',
      queryParameters: params,
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<void> deleteUser(String id) async {
    await _client.delete('/admin/user/$id');
  }

  Future<Map<String, dynamic>> updateUserRole(String id, String role) async {
    final Response res = await _client.patch(
      '/admin/user/$id',
      data: {'role': role},
    );
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getRevenueChart({int days = 30}) async {
    final Response res = await _client.get(
      '/admin/dashboard/revenue-chart',
      queryParameters: {'days': days},
    );
    return res.data['data'] as Map<String, dynamic>;
  }
}
