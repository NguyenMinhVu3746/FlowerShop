import 'package:flutter/foundation.dart';
import '../data/models/product_model.dart' as models;
import '../data/services/product_service.dart';

class ProductProvider with ChangeNotifier {
  final ProductService _productService = ProductService();

  List<models.Product> _products = [];
  List<models.Category> _categories = [];
  List<models.Banner> _banners = [];
  bool _isLoading = false;
  String? _error;

  List<models.Product> get products => _products;
  List<models.Category> get categories => _categories;
  List<models.Banner> get banners => _banners;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadBanners() async {
    try {
      _isLoading = true;
      notifyListeners();

      print('📸 Loading banners...');
      _banners = await _productService.getBanners();
      print('✅ Loaded ${_banners.length} banners');
      
      _isLoading = false;
      _error = null;
      notifyListeners();
    } catch (e) {
      print('❌ Error loading banners: $e');
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadCategories() async {
    try {
      _isLoading = true;
      notifyListeners();

      print('📂 Loading categories...');
      _categories = await _productService.getCategories();
      print('✅ Loaded ${_categories.length} categories');
      
      _isLoading = false;
      _error = null;
      notifyListeners();
    } catch (e) {
      print('❌ Error loading categories: $e');
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadProducts({
    int page = 1,
    int limit = 10,
    String? category,
    String? sort,
    double? minPrice,
    double? maxPrice,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      print('🛍️ Loading products (page: $page, limit: $limit)...');
      final result = await _productService.getProducts(
        page: page,
        limit: limit,
        category: category,
        sort: sort,
        minPrice: minPrice,
        maxPrice: maxPrice,
      );

      print('📦 Result keys: ${result.keys}');
      print('📦 Products in result: ${result['products']}');
      
      _products = result['products'];
      print('✅ Loaded ${_products.length} products');
      
      _isLoading = false;
      _error = null;
      notifyListeners();
    } catch (e, stackTrace) {
      print('❌ Error loading products: $e');
      print('❌ Stack trace: $stackTrace');
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<List<models.Product>> searchProducts(String query) async {
    try {
      return await _productService.searchProducts(query);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return [];
    }
  }

  Future<Map<String, dynamic>?> getProductBySlug(String slug) async {
    try {
      return await _productService.getProductBySlug(slug);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  Future<List<models.Product>> loadProductsByCategory(String categorySlug) async {
    try {
      final result = await _productService.getProducts(
        page: 1,
        limit: 50,
        category: categorySlug,
      );
      return result['products'];
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return [];
    }
  }
}
