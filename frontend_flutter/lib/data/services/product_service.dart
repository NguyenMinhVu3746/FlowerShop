import '../models/product_model.dart';
import '../../core/constants/api_constants.dart';
import 'api_client.dart';

class ProductService {
  final ApiClient _apiClient = ApiClient();

  Future<List<Banner>> getBanners() async {
    try {
      final response = await _apiClient.get(ApiConstants.banners);
      if (response.data['success']) {
        final data = response.data['data'];
        if (data is List) {
          return data.map((b) => Banner.fromJson(b)).toList();
        }
      }
      return [];
    } catch (e) {
      print('Error in getBanners: $e');
      rethrow;
    }
  }

  Future<List<Category>> getCategories() async {
    try {
      final response = await _apiClient.get(ApiConstants.categories);
      if (response.data['success']) {
        final data = response.data['data'];
        if (data is List) {
          return data.map((c) => Category.fromJson(c)).toList();
        }
      }
      return [];
    } catch (e) {
      print('Error in getCategories: $e');
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getProducts({
    int page = 1,
    int limit = 10,
    String? category,
    String? sort,
    double? minPrice,
    double? maxPrice,
  }) async {
    try {
      final params = <String, dynamic>{
        'page': page,
        'limit': limit,
      };
      if (category != null) params['category'] = category;
      if (sort != null) params['sort'] = sort;
      if (minPrice != null) params['minPrice'] = minPrice;
      if (maxPrice != null) params['maxPrice'] = maxPrice;

      final response = await _apiClient.get(
        ApiConstants.products,
        queryParameters: params,
      );

      print('🔍 Products API response: ${response.data}');

      if (response.data['success']) {
        final data = response.data['data'];
        final pagination = data['pagination'] ?? {};
        final products = data['products'] ?? [];
        
        print('🔍 Parsing ${products.length} products...');
        
        return {
          'products': (products as List)
              .map((p) {
                try {
                  return Product.fromJson(p);
                } catch (e) {
                  print('❌ Error parsing product: $e');
                  print('❌ Product data: $p');
                  rethrow;
                }
              })
              .toList(),
          'total': pagination['total'] ?? 0,
          'page': pagination['page'] ?? page,
          'limit': pagination['limit'] ?? limit,
          'totalPages': pagination['totalPages'] ?? 0,
        };
      }
      return {
        'products': <Product>[],
        'total': 0,
        'page': 1,
        'limit': limit,
        'totalPages': 0,
      };
    } catch (e, stackTrace) {
      print('❌ Error in getProducts: $e');
      print('❌ Stack trace: $stackTrace');
      rethrow;
    }
  }

  Future<List<Product>> searchProducts(String query) async {
    try {
      final response = await _apiClient.get(
        ApiConstants.search,
        queryParameters: {'q': query},
      );

      if (response.data['success']) {
        final products = response.data['data']['products'] ?? [];
        return (products as List).map((p) => Product.fromJson(p)).toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getProductBySlug(String slug) async {
    try {
      print('🔍 Loading product by slug: $slug');
      final response = await _apiClient.get(ApiConstants.productBySlug(slug));

      print('🔍 Product detail API response: ${response.data}');

      if (response.data['success']) {
        final data = response.data['data'];
        
        print('🔍 Parsing main product...');
        final product = Product.fromJson(data['product']);
        print('✅ Main product parsed: ${product.title}');
        
        print('🔍 Parsing related products...');
        final relatedProducts = (data['relatedProducts'] as List?)
                ?.map((p) {
                  try {
                    return Product.fromJson(p);
                  } catch (e) {
                    print('❌ Error parsing related product: $e');
                    print('❌ Related product data: $p');
                    rethrow;
                  }
                })
                .toList() ??
            [];
        print('✅ Parsed ${relatedProducts.length} related products');
        
        return {
          'product': product,
          'relatedProducts': relatedProducts,
        };
      }
      throw Exception('Không tìm thấy sản phẩm');
    } catch (e, stackTrace) {
      print('❌ Error in getProductBySlug: $e');
      print('❌ Stack trace: $stackTrace');
      rethrow;
    }
  }
}
