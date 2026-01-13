import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../data/models/product_model.dart' as models;
import '../../data/services/user_service.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/app_utils.dart';
import '../screens/product/product_detail_screen.dart';

class ProductCard extends StatefulWidget {
  final models.Product product;
  final bool showWishlistButton;

  const ProductCard({
    super.key,
    required this.product,
    this.showWishlistButton = false,
  });

  @override
  State<ProductCard> createState() => _ProductCardState();
}

class _ProductCardState extends State<ProductCard> {
  final UserService _userService = UserService();
  bool _isWishlisted = false;
  bool _isLoading = false;

  Future<void> _toggleWishlist() async {
    if (_isLoading) return;

    setState(() => _isLoading = true);
    try {
      final isWishlisted = await _userService.toggleWishlist(widget.product.id);
      setState(() {
        _isWishlisted = isWishlisted;
        _isLoading = false;
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
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) =>
                  ProductDetailScreen(slug: widget.product.slug),
            ),
          );
        },
        child: Stack(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Product Image
                Expanded(
                  flex: 3,
                  child: widget.product.images.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: AppUtils.getImageUrl(
                            widget.product.images.first,
                          ),
                          fit: BoxFit.cover,
                          width: double.infinity,
                          placeholder: (context, url) => Container(
                            color: AppColors.divider,
                            child: const Center(
                              child: CircularProgressIndicator(),
                            ),
                          ),
                          errorWidget: (context, url, error) => Container(
                            color: AppColors.divider,
                            child: const Icon(Icons.error),
                          ),
                        )
                      : Container(
                          color: AppColors.divider,
                          child: Icon(
                            Icons.local_florist,
                            size: 64,
                            color: AppColors.textTertiary,
                          ),
                        ),
                ),
                // Product Info
                Expanded(
                  flex: 2,
                  child: Padding(
                    padding: const EdgeInsets.all(8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            widget.product.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        if (widget.product.avgRating != null &&
                            widget.product.avgRating! > 0)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 2),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.star,
                                  size: 12,
                                  color: AppColors.rating,
                                ),
                                const SizedBox(width: 2),
                                Text(
                                  widget.product.avgRating!.toStringAsFixed(1),
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                const SizedBox(width: 2),
                                Text(
                                  '(${widget.product.totalReviews ?? 0})',
                                  style: TextStyle(
                                    fontSize: 9,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        Text(
                          AppUtils.formatPrice(widget.product.minPrice),
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            // Wishlist button
            if (widget.showWishlistButton)
              Positioned(
                top: 8,
                right: 8,
                child: InkWell(
                  onTap: _toggleWishlist,
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 4,
                        ),
                      ],
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Icon(
                            _isWishlisted
                                ? Icons.favorite
                                : Icons.favorite_border,
                            color: _isWishlisted ? Colors.red : Colors.grey,
                            size: 20,
                          ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
