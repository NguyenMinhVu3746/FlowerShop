import 'product_model.dart';

class CartItem {
  final String variantId;
  final String productId;
  final String title;
  final String image;
  final String size;
  final double price;
  int quantity;
  final int stock;

  CartItem({
    required this.variantId,
    required this.productId,
    required this.title,
    required this.image,
    required this.size,
    required this.price,
    required this.quantity,
    required this.stock,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      variantId: json['variantId'],
      productId: json['productId'],
      title: json['title'],
      image: json['image'],
      size: json['size'],
      price: (json['price'] as num).toDouble(),
      quantity: json['quantity'],
      stock: json['stock'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'variantId': variantId,
      'productId': productId,
      'title': title,
      'image': image,
      'size': size,
      'price': price,
      'quantity': quantity,
      'stock': stock,
    };
  }

  double get totalPrice => price * quantity;
}

class OrderReceiver {
  final String name;
  final String phone;
  final String address;
  final String deliveryDate;
  final String deliverySlot;

  OrderReceiver({
    required this.name,
    required this.phone,
    required this.address,
    required this.deliveryDate,
    required this.deliverySlot,
  });

  factory OrderReceiver.fromJson(Map<String, dynamic> json) {
    return OrderReceiver(
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      address: json['address'] ?? '',
      deliveryDate: json['deliveryDate'] ?? '',
      deliverySlot: json['deliverySlot'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'phone': phone,
      'address': address,
      'deliveryDate': deliveryDate,
      'deliverySlot': deliverySlot,
    };
  }
}

class OrderItem {
  final String id;
  final String variantId;
  final int quantity;
  final double price;
  final dynamic addons;
  final ProductVariant variant;

  OrderItem({
    required this.id,
    required this.variantId,
    required this.quantity,
    required this.price,
    this.addons,
    required this.variant,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] ?? '',
      variantId: json['variantId'] ?? '',
      quantity: json['quantity'] ?? 0,
      price: json['price'] is String 
          ? double.parse(json['price']) 
          : (json['price'] as num).toDouble(),
      addons: json['addons'],
      variant: ProductVariant.fromJson(json['variant']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'variantId': variantId,
      'quantity': quantity,
      'price': price,
      'addons': addons,
      'variant': variant.toJson(),
    };
  }
}

class Payment {
  final String id;
  final String status;
  final String method;
  final double amount;

  Payment({
    required this.id,
    required this.status,
    required this.method,
    required this.amount,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'] ?? '',
      status: json['status'] ?? 'PENDING',
      method: json['method'] ?? 'COD',
      amount: json['amount'] is String 
          ? double.parse(json['amount']) 
          : (json['amount'] as num).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'status': status,
      'method': method,
      'amount': amount,
    };
  }
}

class Order {
  final String id;
  final String userId;
  final String status;
  final double total;
  final String? note;
  final String? messageCard;
  final String senderType;
  final String createdAt;
  final String updatedAt;
  final OrderReceiver receiver;
  final List<OrderItem> items;
  final Payment payment;

  Order({
    required this.id,
    required this.userId,
    required this.status,
    required this.total,
    this.note,
    this.messageCard,
    required this.senderType,
    required this.createdAt,
    required this.updatedAt,
    required this.receiver,
    required this.items,
    required this.payment,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    try {
      return Order(
        id: json['id'] ?? '',
        userId: json['userId'] ?? '',
        status: json['status'] ?? 'PENDING',
        total: json['total'] is String 
            ? double.parse(json['total']) 
            : (json['total'] as num).toDouble(),
        note: json['note'],
        messageCard: json['messageCard'],
        senderType: json['senderType'] ?? 'NAMED',
        createdAt: json['createdAt'] ?? '',
        updatedAt: json['updatedAt'] ?? '',
        receiver: OrderReceiver.fromJson(json['receiver']),
        items: (json['items'] as List).map((i) => OrderItem.fromJson(i)).toList(),
        payment: Payment.fromJson(json['payment']),
      );
    } catch (e, stackTrace) {
      print('❌ Error parsing Order: $e');
      print('❌ StackTrace: $stackTrace');
      print('❌ JSON: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'status': status,
      'total': total,
      'note': note,
      'messageCard': messageCard,
      'senderType': senderType,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'receiver': receiver.toJson(),
      'items': items.map((i) => i.toJson()).toList(),
      'payment': payment.toJson(),
    };
  }
}
