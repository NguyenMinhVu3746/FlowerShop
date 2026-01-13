import 'dart:io';
import 'dart:convert';
import '../../core/constants/api_constants.dart';
import 'api_client.dart';

class UploadService {
  final ApiClient _apiClient = ApiClient();

  Future<String> uploadImage(File imageFile) async {
    try {
      // Read file as bytes and convert to base64
      final bytes = await imageFile.readAsBytes();
      final base64Image = base64Encode(bytes);

      // Determine image type from file extension
      final extension = imageFile.path.split('.').last.toLowerCase();
      String mimeType = 'image/jpeg';
      if (extension == 'png') {
        mimeType = 'image/png';
      } else if (extension == 'gif') {
        mimeType = 'image/gif';
      } else if (extension == 'webp') {
        mimeType = 'image/webp';
      }

      final response = await _apiClient.post(
        ApiConstants.upload,
        data: {
          'images': ['data:$mimeType;base64,$base64Image'],
          'folder': 'hoashop/users',
        },
      );

      if (response.data['success']) {
        // Backend returns nested structure: {success, data: {message, data: {images}}}
        final dataField = response.data['data'];
        final images = dataField['data']?['images'] as List?;
        if (images != null && images.isNotEmpty) {
          return images[0]['url'] ?? '';
        }
      }
      throw Exception('Upload thất bại');
    } catch (e) {
      rethrow;
    }
  }
}
