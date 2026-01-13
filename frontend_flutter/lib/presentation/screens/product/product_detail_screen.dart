import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:carousel_slider/carousel_slider.dart';
import '../../../data/models/product_model.dart' as models;
import '../../../data/services/user_service.dart';
import '../../../providers/cart_provider.dart';
import '../../../providers/product_provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/app_utils.dart';
import '../../widgets/product_card.dart';
import '../auth/login_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  final String slug;

  const ProductDetailScreen({super.key, required this.slug});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final UserService _userService = UserService();
  models.Product? _product;
  List<models.Product> _relatedProducts = [];
  models.ProductVariant? _selectedVariant;
  int _quantity = 1;
  bool _isLoading = true;
  bool _isWishlisted = false;
  bool _isWishlistLoading = false;
  int _currentImageIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadProduct();
    _checkWishlistStatus();
  }

  Future<void> _checkWishlistStatus() async {
    if (_product == null) return;
    
    // Only check if user is logged in
    final authProvider = context.read<AuthProvider>();
    if (!authProvider.isAuthenticated) return;
    
    try {
      final wishlist = await _userService.getWishlist();
      setState(() {
        _isWishlisted = wishlist.any((p) => p.id == _product!.id);
      });
    } catch (e) {
      // Ignore error, just don't show wishlist status
    }
  }

  Future<void> _toggleWishlist() async {
    if (_product == null || _isWishlistLoading) return;

    // Check if user is logged in
    final authProvider = context.read<AuthProvider>();
    if (!authProvider.isAuthenticated) {
      // Show login screen
      await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => const LoginScreen(
            message: 'Vui lòng đăng nhập để thêm vào yêu thích',
          ),
        ),
      );
      return;
    }

    setState(() => _isWishlistLoading = true);
    try {
      final isWishlisted = await _userService.toggleWishlist(_product!.id);
      setState(() {
        _isWishlisted = isWishlisted;
        _isWishlistLoading = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              isWishlisted ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích',
            ),
            duration: const Duration(seconds: 1),
          ),
        );
      }
    } catch (e) {
      setState(() => _isWishlistLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi: $e')));
      }
    }
  }

  Future<void> _loadProduct() async {
    try {
      final productProvider = context.read<ProductProvider>();
      print('🔍 Loading product with slug: ${widget.slug}');
      final result = await productProvider.getProductBySlug(widget.slug);

      if (result != null && mounted) {
        print('✅ Product loaded successfully');
        setState(() {
          _product = result['product'];
          _relatedProducts = result['relatedProducts'] ?? [];
          if (_product!.variants.isNotEmpty) {
            _selectedVariant = _product!.variants.first;
          }
          _isLoading = false;
        });
      } else {
        print('❌ Product not found');
        setState(() {
          _isLoading = false;
        });
      }
    } catch (e) {
      print('❌ Error loading product: $e');
      setState(() {
        _isLoading = false;
      });
    }

    // Check wishlist after product loads
    _checkWishlistStatus();
  }

  void _addToCart() {
    if (_selectedVariant == null || _product == null) return;

    final cart = context.read<CartProvider>();
    cart.addItem(
      variantId: _selectedVariant!.id,
      productId: _product!.id,
      title: _product!.title,
      image: _product!.images.isNotEmpty ? _product!.images.first : '',
      size: _selectedVariant!.size,
      price: _selectedVariant!.price,
      stock: _selectedVariant!.stock,
      quantity: _quantity,
    );

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Đã thêm vào giỏ hàng'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_product == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Sản phẩm')),
        body: const Center(child: Text('Không tìm thấy sản phẩm')),
      );
    }

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App Bar with Images
          SliverAppBar(
            expandedHeight: 400,
            pinned: true,
            actions: [
              // Wishlist button
              IconButton(
                onPressed: _isWishlistLoading ? null : _toggleWishlist,
                icon: _isWishlistLoading
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Icon(
                        _isWishlisted ? Icons.favorite : Icons.favorite_border,
                        color: _isWishlisted ? Colors.red : Colors.white,
                      ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: _product!.images.isNotEmpty
                  ? Stack(
                      children: [
                        CarouselSlider(
                          options: CarouselOptions(
                            height: 400,
                            viewportFraction: 1.0,
                            onPageChanged: (index, reason) {
                              setState(() {
                                _currentImageIndex = index;
                              });
                            },
                          ),
                          items: _product!.images.map((image) {
                            return CachedNetworkImage(
                              imageUrl: AppUtils.getImageUrl(image),
                              fit: BoxFit.cover,
                              width: double.infinity,
                              placeholder: (context, url) => Container(
                                color: AppColors.divider,
                                child: const Center(
                                  child: CircularProgressIndicator(),
                                ),
                              ),
                              errorWidget: (context, url, error) =>
                                  const Icon(Icons.error),
                            );
                          }).toList(),
                        ),
                        Positioned(
                          bottom: 16,
                          left: 0,
                          right: 0,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: _product!.images.asMap().entries.map((
                              entry,
                            ) {
                              return Container(
                                width: 8,
                                height: 8,
                                margin: const EdgeInsets.symmetric(
                                  horizontal: 4,
                                ),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: _currentImageIndex == entry.key
                                      ? Colors.white
                                      : Colors.white.withOpacity(0.4),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ],
                    )
                  : Container(
                      color: AppColors.divider,
                      child: const Icon(Icons.local_florist, size: 100),
                    ),
            ),
          ),

          // Product Info
          SliverToBoxAdapter(
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  Text(
                    _product!.title,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Category
                  Text(
                    _product!.category.name,
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Rating
                  if (_product!.avgRating != null)
                    Row(
                      children: [
                        Icon(Icons.star, color: AppColors.rating, size: 20),
                        const SizedBox(width: 4),
                        Text(
                          _product!.avgRating!.toStringAsFixed(1),
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '(${_product!.totalReviews ?? 0} đánh giá)',
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  const SizedBox(height: 16),

                  // Price
                  Text(
                    AppUtils.formatPrice(_selectedVariant?.price ?? 0),
                    style: const TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Size Selection
                  const Text(
                    'Kích thước',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    children: _product!.variants.map((variant) {
                      final isSelected = _selectedVariant?.id == variant.id;
                      return ChoiceChip(
                        label: Text(variant.size),
                        selected: isSelected,
                        onSelected: variant.stock > 0
                            ? (selected) {
                                setState(() {
                                  _selectedVariant = variant;
                                  if (_quantity > variant.stock) {
                                    _quantity = variant.stock;
                                  }
                                });
                              }
                            : null,
                        selectedColor: AppColors.primary,
                        labelStyle: TextStyle(
                          color: isSelected
                              ? Colors.white
                              : AppColors.textPrimary,
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 24),

                  // Quantity
                  Row(
                    children: [
                      const Text(
                        'Số lượng',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.remove_circle_outline),
                        onPressed: _quantity > 1
                            ? () => setState(() => _quantity--)
                            : null,
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          border: Border.all(color: AppColors.divider),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '$_quantity',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.add_circle_outline),
                        onPressed: _quantity < (_selectedVariant?.stock ?? 0)
                            ? () => setState(() => _quantity++)
                            : null,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Còn ${_selectedVariant?.stock ?? 0} sản phẩm',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Description
                  const Text(
                    'Mô tả',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _product!.description ?? 'Không có mô tả',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                      height: 1.5,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Related Products
          if (_relatedProducts.isNotEmpty) ...[
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.all(16),
                child: const Text(
                  'Sản phẩm liên quan',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.7,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                delegate: SliverChildBuilderDelegate((context, index) {
                  return ProductCard(product: _relatedProducts[index]);
                }, childCount: _relatedProducts.length),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: (_selectedVariant?.stock ?? 0) > 0
                      ? _addToCart
                      : null,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('Thêm vào giỏ hàng'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
