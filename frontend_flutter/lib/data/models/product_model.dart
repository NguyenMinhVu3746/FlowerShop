class Category {
  final String id;
  final String name;
  final String slug;
  final String? description;
  final String? image;
  final String? parentId;
  final Category? parent;
  final List<Category>? children;

  Category({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.image,
    this.parentId,
    this.parent,
    this.children,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'],
      name: json['name'],
      slug: json['slug'],
      description: json['description'],
      image: json['image'],
      parentId: json['parentId'],
      parent: json['parent'] != null ? Category.fromJson(json['parent']) : null,
      children: json['children'] != null
          ? (json['children'] as List).map((c) => Category.fromJson(c)).toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      'image': image,
      'parentId': parentId,
      'parent': parent?.toJson(),
      'children': children?.map((c) => c.toJson()).toList(),
    };
  }
}

class ProductVariant {
  final String id;
  final String productId;
  final String size;
  final double price;
  final String? description;
  final int stock;
  final bool isActive;
  final Product? product; // For order items

  ProductVariant({
    required this.id,
    required this.productId,
    required this.size,
    required this.price,
    this.description,
    required this.stock,
    required this.isActive,
    this.product,
  });

  factory ProductVariant.fromJson(Map<String, dynamic> json) {
    return ProductVariant(
      id: json['id'] ?? '',
      productId: json['productId'] ?? '',
      size: json['size'] ?? '',
      price: json['price'] is String 
          ? double.parse(json['price']) 
          : (json['price'] as num).toDouble(),
      description: json['description'],
      stock: json['stock'] ?? 0,
      isActive: json['isActive'] ?? true,
      product: json['product'] != null ? Product.fromJson(json['product']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'productId': productId,
      'size': size,
      'price': price,
      'description': description,
      'stock': stock,
      'isActive': isActive,
      if (product != null) 'product': product!.toJson(),
    };
  }
}

class Product {
  final String id;
  final String title;
  final String slug;
  final String? description;
  final List<String> images;
  final String categoryId;
  final Category category;
  final String? metaTitle;
  final String? metaDescription;
  final String? metaKeywords;
  final bool isActive;
  final String createdAt;
  final String updatedAt;
  final List<ProductVariant> variants;
  final double? avgRating;
  final int? totalReviews;

  Product({
    required this.id,
    required this.title,
    required this.slug,
    this.description,
    required this.images,
    required this.categoryId,
    required this.category,
    this.metaTitle,
    this.metaDescription,
    this.metaKeywords,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
    required this.variants,
    this.avgRating,
    this.totalReviews,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    // Parse images - can be array or space-separated string
    List<String> imageList = [];
    if (json['images'] != null) {
      if (json['images'] is List) {
        imageList = List<String>.from(json['images']);
      } else if (json['images'] is String) {
        imageList = (json['images'] as String)
            .split(' ')
            .where((s) => s.isNotEmpty)
            .toList();
      }
    }

    // Parse category - create placeholder if not provided
    Category category;
    if (json['category'] != null) {
      category = Category.fromJson(json['category']);
    } else {
      // Create a placeholder category for related products
      category = Category(
        id: json['categoryId'] ?? '',
        name: '',
        slug: '',
        description: null,
        image: null,
        parentId: null,
        parent: null,
        children: null,
      );
    }

    return Product(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      slug: json['slug'] ?? '',
      description: json['description'],
      images: imageList,
      categoryId: json['categoryId'] ?? '',
      category: category,
      metaTitle: json['metaTitle'],
      metaDescription: json['metaDescription'],
      metaKeywords: json['metaKeywords'],
      isActive: json['isActive'] ?? true,
      createdAt: json['createdAt'] ?? '',
      updatedAt: json['updatedAt'] ?? '',
      variants: (json['variants'] as List?)
              ?.map((v) => ProductVariant.fromJson(v))
              .toList() ??
          [],
      avgRating: json['averageRating'] != null 
          ? (json['averageRating'] as num).toDouble() 
          : (json['avgRating'] != null ? (json['avgRating'] as num).toDouble() : null),
      totalReviews: json['_count']?['reviews'] ?? json['totalReviews'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'slug': slug,
      'description': description,
      'images': images,
      'categoryId': categoryId,
      'category': category.toJson(),
      'metaTitle': metaTitle,
      'metaDescription': metaDescription,
      'metaKeywords': metaKeywords,
      'isActive': isActive,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'variants': variants.map((v) => v.toJson()).toList(),
      'avgRating': avgRating,
      'totalReviews': totalReviews,
    };
  }

  double get minPrice {
    if (variants.isEmpty) return 0;
    return variants.map((v) => v.price).reduce((a, b) => a < b ? a : b);
  }

  double get maxPrice {
    if (variants.isEmpty) return 0;
    return variants.map((v) => v.price).reduce((a, b) => a > b ? a : b);
  }
}

class Banner {
  final String id;
  final String title;
  final String image;
  final String? link;
  final String? description;
  final int order;
  final bool isActive;

  Banner({
    required this.id,
    required this.title,
    required this.image,
    this.link,
    this.description,
    required this.order,
    required this.isActive,
  });

  factory Banner.fromJson(Map<String, dynamic> json) {
    return Banner(
      id: json['id'],
      title: json['title'],
      image: json['image'],
      link: json['link'],
      description: json['description'],
      order: json['order'] ?? 0,
      isActive: json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'image': image,
      'link': link,
      'description': description,
      'order': order,
      'isActive': isActive,
    };
  }
}
