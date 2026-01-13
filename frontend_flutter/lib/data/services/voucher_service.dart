import 'package:dio/dio.dart';
import '../../core/constants/api_constants.dart';

class VoucherService {
  final Dio _apiClient;

  VoucherService() : _apiClient = Dio(BaseOptions(baseUrl: ApiConstants.baseUrl));

  Future<Map<String, dynamic>> validateVoucher({
    required String code,
    required double totalPrice,
  }) async {
    try {
      print('🎫 Validating voucher: $code, totalPrice: $totalPrice');
      final response = await _apiClient.get(
        '/voucher/validate',
        queryParameters: {
          'code': code,
          'totalPrice': totalPrice,
        },
      );

      print('🎫 Response: ${response.data}');

      if (response.data['success']) {
        final data = response.data['data'];
        print('🎫 Voucher data: ${data['voucher']}');
        print('🎫 Discount: ${data['discount']}');
        
        return {
          'valid': true,
          'voucher': Map<String, dynamic>.from(data['voucher'] as Map),
          'discount': data['discount'],
        };
      }

      return {
        'valid': false,
        'message': response.data['message'] ?? 'Mã không hợp lệ',
      };
    } on DioException catch (e) {
      print('❌ DioException: ${e.response?.data}');
      print('❌ Status code: ${e.response?.statusCode}');
      
      // Lấy message từ backend response
      String message = 'Lỗi kiểm tra mã giảm giá';
      if (e.response?.data != null) {
        if (e.response!.data is Map) {
          // Backend trả 'error' hoặc 'message'
          message = e.response!.data['error'] ?? e.response!.data['message'] ?? message;
        }
      }
      
      return {
        'valid': false,
        'message': message,
      };
    } catch (e) {
      print('❌ Error: $e');
      return {
        'valid': false,
        'message': 'Lỗi: ${e.toString()}',
      };
    }
  }
}
