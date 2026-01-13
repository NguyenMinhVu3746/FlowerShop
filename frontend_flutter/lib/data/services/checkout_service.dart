import '../models/order_model.dart';
import '../../core/constants/api_constants.dart';
import 'api_client.dart';

class CheckoutService {
  final ApiClient _apiClient = ApiClient();

  Future<Order> checkout({
    required List<Map<String, dynamic>> items,
    required Map<String, dynamic> receiver,
    required String paymentMethod,
    String? voucherCode,
    String? note,
    String? messageCard,
    required String senderType,
  }) async {
    try {
      final data = {
        'items': items,
        'receiver': receiver,
        'paymentMethod': paymentMethod,
        'senderType': senderType,
      };
      
      if (voucherCode != null) {
        print('🛒 Voucher code: $voucherCode (${voucherCode.runtimeType})');
        data['voucherCode'] = voucherCode;
      }
      if (note != null) data['note'] = note;
      if (messageCard != null) data['messageCard'] = messageCard;

      print('🛒 Checkout data: $data');

      final response = await _apiClient.post(ApiConstants.checkout, data: data);

      if (response.data['success']) {
        return Order.fromJson(response.data['data']['order']);
      }
      throw Exception('Đặt hàng thất bại');
    } catch (e) {
      rethrow;
    }
  }
}
