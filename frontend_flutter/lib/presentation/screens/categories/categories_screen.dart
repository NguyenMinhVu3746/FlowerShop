import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/product_provider.dart';
import '../../../data/models/product_model.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/app_utils.dart';
import '../../widgets/product_card.dart';

class CategoriesScreen extends StatefulWidget {
  const CategoriesScreen({super.key});

  @override
  State<CategoriesScreen> createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends State<CategoriesScreen> {
  Category? _selectedCategory;
  List<Product> _categoryProducts = [];
  bool _isLoadingProducts = false;
  String? _sortBy;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final productProvider = Provider.of<ProductProvider>(
        context,
        listen: false,
      );
      if (productProvider.categories.isEmpty) {
        productProvider.loadCategories();
      }
      // Load all products by default
      _loadAllProducts();
    });
  }

  Future<void> _loadAllProducts() async {
    setState(() {
      _isLoadingProducts = true;
      _selectedCategory = null;
    });

    try {
      final productProvider = Provider.of<ProductProvider>(
        context,
        listen: false,
      );
      await productProvider.loadProducts(limit: 100);

      // Sort products locally
      var products = List<Product>.from(productProvider.products);
      _sortProducts(products);

      setState(() {
        _categoryProducts = products;
        _isLoadingProducts = false;
      });
    } catch (e) {
      setState(() => _isLoadingProducts = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi: $e')));
      }
    }
  }

  Future<void> _loadCategoryProducts(String categorySlug) async {
    setState(() => _isLoadingProducts = true);

    try {
      final productProvider = Provider.of<ProductProvider>(
        context,
        listen: false,
      );
      var products = await productProvider.loadProductsByCategory(categorySlug);

      // Sort products locally
      _sortProducts(products);

      setState(() {
        _categoryProducts = products;
        _isLoadingProducts = false;
      });
    } catch (e) {
      setState(() => _isLoadingProducts = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi: $e')));
      }
    }
  }

  void _sortProducts(List<Product> products) {
    if (_sortBy == null) return;

    switch (_sortBy) {
      case 'price_asc':
        products.sort((a, b) => a.minPrice.compareTo(b.minPrice));
        break;
      case 'price_desc':
        products.sort((a, b) => b.minPrice.compareTo(a.minPrice));
        break;
      case 'newest':
        products.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        break;
      case 'best_selling':
        // Sort by total reviews as proxy for best selling
        products.sort(
          (a, b) => (b.totalReviews ?? 0).compareTo(a.totalReviews ?? 0),
        );
        break;
    }
  }

  void _showSortDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sắp xếp theo'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<String?>(
              title: const Text('Mặc định'),
              value: null,
              groupValue: _sortBy,
              onChanged: (value) {
                setState(() => _sortBy = value);
                Navigator.pop(context);
                if (_selectedCategory != null) {
                  _loadCategoryProducts(_selectedCategory!.slug);
                } else {
                  _loadAllProducts();
                }
              },
            ),
            RadioListTile<String>(
              title: const Text('Giá thấp đến cao'),
              value: 'price_asc',
              groupValue: _sortBy,
              onChanged: (value) {
                setState(() => _sortBy = value);
                Navigator.pop(context);
                if (_selectedCategory != null) {
                  _loadCategoryProducts(_selectedCategory!.slug);
                } else {
                  _loadAllProducts();
                }
              },
            ),
            RadioListTile<String>(
              title: const Text('Giá cao đến thấp'),
              value: 'price_desc',
              groupValue: _sortBy,
              onChanged: (value) {
                setState(() => _sortBy = value);
                Navigator.pop(context);
                if (_selectedCategory != null) {
                  _loadCategoryProducts(_selectedCategory!.slug);
                } else {
                  _loadAllProducts();
                }
              },
            ),
            RadioListTile<String>(
              title: const Text('Mới nhất'),
              value: 'newest',
              groupValue: _sortBy,
              onChanged: (value) {
                setState(() => _sortBy = value);
                Navigator.pop(context);
                if (_selectedCategory != null) {
                  _loadCategoryProducts(_selectedCategory!.slug);
                } else {
                  _loadAllProducts();
                }
              },
            ),
            RadioListTile<String>(
              title: const Text('Bán chạy nhất'),
              value: 'best_selling',
              groupValue: _sortBy,
              onChanged: (value) {
                setState(() => _sortBy = value);
                Navigator.pop(context);
                if (_selectedCategory != null) {
                  _loadCategoryProducts(_selectedCategory!.slug);
                } else {
                  _loadAllProducts();
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Danh mục'),
        actions: [
          IconButton(
            icon: Badge(
              isLabelVisible: _sortBy != null,
              child: const Icon(Icons.sort),
            ),
            onPressed: _showSortDialog,
            tooltip: 'Sắp xếp',
          ),
        ],
      ),
      body: Consumer<ProductProvider>(
        builder: (context, productProvider, child) {
          if (productProvider.isLoading && productProvider.categories.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (productProvider.categories.isEmpty) {
            return const Center(child: Text('Không có danh mục nào'));
          }

          return Row(
            children: [
              // Categories sidebar
              Container(
                width: 90,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  border: Border(
                    right: BorderSide(color: AppColors.border, width: 1),
                  ),
                ),
                child: ListView.builder(
                  itemCount: productProvider.categories.length + 1,
                  itemBuilder: (context, index) {
                    // First item is "All categories"
                    if (index == 0) {
                      final isSelected = _selectedCategory == null;
                      return InkWell(
                        onTap: () => _loadAllProducts(),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppColors.primary.withOpacity(0.1)
                                : null,
                            border: Border(
                              left: BorderSide(
                                color: isSelected
                                    ? AppColors.primary
                                    : Colors.transparent,
                                width: 3,
                              ),
                            ),
                          ),
                          child: Column(
                            children: [
                              Icon(
                                Icons.apps,
                                color: isSelected
                                    ? AppColors.primary
                                    : AppColors.textPrimary,
                                size: 28,
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Tất cả',
                                textAlign: TextAlign.center,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: isSelected
                                      ? FontWeight.w600
                                      : FontWeight.normal,
                                  color: isSelected
                                      ? AppColors.primary
                                      : AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    }

                    final category = productProvider.categories[index - 1];
                    final isSelected = _selectedCategory?.id == category.id;

                    return InkWell(
                      onTap: () {
                        setState(() => _selectedCategory = category);
                        _loadCategoryProducts(category.slug);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.primary.withOpacity(0.1)
                              : null,
                          border: Border(
                            left: BorderSide(
                              color: isSelected
                                  ? AppColors.primary
                                  : Colors.transparent,
                              width: 3,
                            ),
                          ),
                        ),
                        child: Column(
                          children: [
                            if (category.image != null &&
                                category.image!.isNotEmpty)
                              ClipRRect(
                                borderRadius: BorderRadius.circular(6),
                                child: Image.network(
                                  AppUtils.getImageUrl(category.image!),
                                  width: 40,
                                  height: 40,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Container(
                                      width: 48,
                                      height: 48,
                                      decoration: BoxDecoration(
                                        color: AppColors.primary.withOpacity(
                                          0.1,
                                        ),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: const Icon(
                                        Icons.category_outlined,
                                        color: AppColors.primary,
                                        size: 20,
                                      ),
                                    );
                                  },
                                ),
                              )
                            else
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Icon(
                                  Icons.category_outlined,
                                  color: AppColors.primary,
                                  size: 20,
                                ),
                              ),
                            const SizedBox(height: 6),
                            Text(
                              category.name,
                              textAlign: TextAlign.center,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: isSelected
                                    ? FontWeight.w600
                                    : FontWeight.normal,
                                color: isSelected
                                    ? AppColors.primary
                                    : AppColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

              // Products grid
              Expanded(
                child: _isLoadingProducts
                    ? const Center(child: CircularProgressIndicator())
                    : _categoryProducts.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.shopping_bag_outlined,
                              size: 80,
                              color: AppColors.textTertiary,
                            ),
                            const SizedBox(height: 16),
                            const Text('Chưa có sản phẩm trong danh mục này'),
                          ],
                        ),
                      )
                    : LayoutBuilder(
                        builder: (context, constraints) {
                          // Calculate crossAxisCount based on available width
                          final width = constraints.maxWidth;
                          int crossAxisCount;
                          double childAspectRatio;

                          if (width > 600) {
                            crossAxisCount = 3;
                            childAspectRatio = 0.68;
                          } else {
                            crossAxisCount = 2;
                            childAspectRatio = 0.58;
                          }

                          return GridView.builder(
                            padding: const EdgeInsets.all(16),
                            gridDelegate:
                                SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: crossAxisCount,
                                  childAspectRatio: childAspectRatio,
                                  crossAxisSpacing: 12,
                                  mainAxisSpacing: 12,
                                ),
                            itemCount: _categoryProducts.length,
                            itemBuilder: (context, index) {
                              return ProductCard(
                                product: _categoryProducts[index],
                              );
                            },
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}
