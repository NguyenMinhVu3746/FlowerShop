import '../models/ai_model.dart';
import '../../core/constants/api_constants.dart';
import 'api_client.dart';

class AIService {
  final ApiClient _apiClient = ApiClient();

  Future<AIChatResponse> chat({
    String? message,
    String? image,
    List<AIChatMessage>? conversationHistory,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (message != null) {
        print('📤 Sending message: "$message"');
        print('📤 Message bytes: ${message.codeUnits}');
        data['message'] = message;
      }
      if (image != null) data['image'] = image;
      if (conversationHistory != null) {
        data['conversationHistory'] =
            conversationHistory.map((m) => m.toJson()).toList();
      }

      print('📤 Request data: $data');

      final response = await _apiClient.post(ApiConstants.aiChat, data: data);

      print('🔍 AI Chat Raw Response: ${response.data}');
      print('🔍 Success: ${response.data['success']}');
      print('🔍 Data type: ${response.data['data'].runtimeType}');
      print('🔍 Data keys: ${response.data['data']?.keys}');
      if (response.data['data'] != null) {
        final data = response.data['data'];
        print('🔍 Response text: ${data['response']}');
        print('🔍 Suggestions type: ${data['suggestions'].runtimeType}');
        print('🔍 Suggestions value: ${data['suggestions']}');
        print('🔍 Suggestions length: ${data['suggestions']?.length}');
        print('🔍 Image Analysis: ${data['imageAnalysis']}');
      }

      if (response.data['success']) {
        final result = AIChatResponse.fromJson(response.data['data']);
        print('🎯 Parsed AIChatResponse:');
        print('  - response: ${result.response}');
        print('  - suggestions: ${result.suggestions}');
        print('  - imageAnalysis: ${result.imageAnalysis}');
        return result;
      }
      throw Exception('AI chat failed');
    } catch (e) {
      rethrow;
    }
  }

  Future<List<String>> suggestMessage({
    required String occasion,
    required String recipient,
    required String relationship,
    String tone = 'casual',
  }) async {
    try {
      final response = await _apiClient.post(
        ApiConstants.aiSuggestMessage,
        data: {
          'occasion': occasion,
          'recipient': recipient,
          'relationship': relationship,
          'tone': tone,
        },
      );

      print('🔍 AI Service Response: ${response.data}');
      print('🔍 Success: ${response.data['success']}');
      print('🔍 Data: ${response.data['data']}');

      if (response.data['success']) {
        final data = response.data['data'];
        print('🔍 Data keys: ${data?.keys}');
        final suggestions = data['suggestions'] ?? [];
        print('🔍 Suggestions: $suggestions (${suggestions.length} items)');
        return List<String>.from(suggestions);
      }
      return [];
    } catch (e) {
      print('❌ AI Service Error: $e');
      rethrow;
    }
  }
}
