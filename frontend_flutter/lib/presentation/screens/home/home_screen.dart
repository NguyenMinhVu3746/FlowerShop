import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:carousel_slider/carousel_slider.dart';
import '../../../providers/product_provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/app_utils.dart';
import '../../../data/models/product_model.dart' as models;
import '../../widgets/product_card.dart';
import '../search/search_screen.dart';
import '../main_screen.dart';

class HomeScreen extends StatefulWidget {
  final Function(int)? onNavigateToTab;
  const HomeScreen({super.key, this.onNavigateToTab});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final productProvider = context.read<ProductProvider>();
      productProvider.loadBanners();
      productProvider.loadCategories();
      productProvider.loadProducts(limit: 20, sort: 'best_selling');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // Search Bar
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.all(16),
                color: Colors.white,
                child: GestureDetector(
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const SearchScreen(),
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.divider),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.search, color: AppColors.textTertiary),
                        const SizedBox(width: 12),
                        Text(
                          'Tìm kiếm sản phẩm...',
                          style: TextStyle(
                            color: AppColors.textTertiary,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // Banners
            SliverToBoxAdapter(
              child: Consumer<ProductProvider>(
                builder: (context, provider, _) {
                  if (provider.isLoading && provider.banners.isEmpty) {
                    return Container(
                      height: 180,
                      margin: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.divider,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Center(child: CircularProgressIndicator()),
                    );
                  }

                  if (provider.banners.isEmpty) {
                    return const SizedBox.shrink();
                  }

                  return Container(
                    margin: const EdgeInsets.symmetric(vertical: 8),
                    child: CarouselSlider(
                      options: CarouselOptions(
                        height: 180,
                        autoPlay: true,
                        autoPlayInterval: const Duration(seconds: 3),
                        enlargeCenterPage: true,
                        aspectRatio: 16 / 9,
                        viewportFraction: 0.9,
                      ),
                      items: provider.banners.map((banner) {
                        return Builder(
                          builder: (BuildContext context) {
                            return Container(
                              width: MediaQuery.of(context).size.width,
                              margin: const EdgeInsets.symmetric(
                                horizontal: 5.0,
                              ),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.1),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: CachedNetworkImage(
                                  imageUrl: AppUtils.getImageUrl(banner.image),
                                  fit: BoxFit.cover,
                                  placeholder: (context, url) => Container(
                                    color: AppColors.divider,
                                    child: const Center(
                                      child: CircularProgressIndicator(),
                                    ),
                                  ),
                                  errorWidget: (context, url, error) =>
                                      Container(
                                        color: AppColors.divider,
                                        child: const Icon(
                                          Icons.broken_image,
                                          size: 48,
                                          color: AppColors.textTertiary,
                                        ),
                                      ),
                                ),
                              ),
                            );
                          },
                        );
                      }).toList(),
                    ),
                  );
                },
              ),
            ),

            // Categories
            SliverToBoxAdapter(
              child: Consumer<ProductProvider>(
                builder: (context, provider, _) {
                  if (provider.categories.isEmpty) {
                    return const SizedBox.shrink();
                  }
                  return Container(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    color: Colors.white,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            'Danh mục',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        SizedBox(
                          height: 100,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            itemCount: provider.categories.length,
                            itemBuilder: (context, index) {
                              final category = provider.categories[index];
                              return _buildCategoryItem(category);
                            },
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 16)),

            // Featured Products
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Sản phẩm nổi bật',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        print('🏠 Xem tất cả clicked');
                        print('🏠 onNavigateToTab: ${widget.onNavigateToTab}');
                        // Navigate to Categories tab
                        if (widget.onNavigateToTab != null) {
                          widget.onNavigateToTab!(1);
                        } else {
                          print('❌ onNavigateToTab is null');
                        }
                      },
                      child: const Text('Xem tất cả'),
                    ),
                  ],
                ),
              ),
            ),

            // Products Grid
            Consumer<ProductProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading) {
                  return const SliverToBoxAdapter(
                    child: Center(
                      child: Padding(
                        padding: EdgeInsets.all(32.0),
                        child: CircularProgressIndicator(),
                      ),
                    ),
                  );
                }

                if (provider.products.isEmpty) {
                  return const SliverToBoxAdapter(
                    child: Center(
                      child: Padding(
                        padding: EdgeInsets.all(32.0),
                        child: Text('Không có sản phẩm nào'),
                      ),
                    ),
                  );
                }

                return SliverPadding(
                  padding: const EdgeInsets.all(16),
                  sliver: SliverGrid(
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.7,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                        ),
                    delegate: SliverChildBuilderDelegate((context, index) {
                      return ProductCard(product: provider.products[index]);
                    }, childCount: provider.products.length),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryItem(models.Category category) {
    return Container(
      width: 80,
      margin: const EdgeInsets.symmetric(horizontal: 4),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: category.image != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: CachedNetworkImage(
                      imageUrl: AppUtils.getImageUrl(category.image!),
                      fit: BoxFit.cover,
                      errorWidget: (context, url, error) =>
                          Icon(Icons.category, color: AppColors.primary),
                    ),
                  )
                : Icon(Icons.category, color: AppColors.primary),
          ),
          const SizedBox(height: 6),
          Flexible(
            child: Text(
              category.name,
              maxLines: 2,
              textAlign: TextAlign.center,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }
}
