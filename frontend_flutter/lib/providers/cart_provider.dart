import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../data/models/order_model.dart';

class CartProvider with ChangeNotifier {
  List<CartItem> _items = [];

  List<CartItem> get items => _items;
  int get itemCount => _items.length;
  
  double get totalAmount {
    return _items.fold(0, (sum, item) => sum + item.totalPrice);
  }

  CartProvider() {
    _loadCart();
  }

  Future<void> _loadCart() async {
    final prefs = await SharedPreferences.getInstance();
    final cartJson = prefs.getString('cart');
    if (cartJson != null) {
      final List<dynamic> decoded = json.decode(cartJson);
      _items = decoded.map((item) => CartItem.fromJson(item)).toList();
      notifyListeners();
    }
  }

  Future<void> _saveCart() async {
    final prefs = await SharedPreferences.getInstance();
    final cartJson = json.encode(_items.map((item) => item.toJson()).toList());
    await prefs.setString('cart', cartJson);
  }

  void addItem({
    required String variantId,
    required String productId,
    required String title,
    required String image,
    required String size,
    required double price,
    required int stock,
    int quantity = 1,
  }) {
    final existingIndex = _items.indexWhere((item) => item.variantId == variantId);
    
    if (existingIndex >= 0) {
      // Item exists, increase quantity
      final newQuantity = _items[existingIndex].quantity + quantity;
      if (newQuantity <= stock) {
        _items[existingIndex].quantity = newQuantity;
      }
    } else {
      // Add new item
      _items.add(CartItem(
        variantId: variantId,
        productId: productId,
        title: title,
        image: image,
        size: size,
        price: price,
        quantity: quantity,
        stock: stock,
      ));
    }
    
    _saveCart();
    notifyListeners();
  }

  void removeItem(String variantId) {
    _items.removeWhere((item) => item.variantId == variantId);
    _saveCart();
    notifyListeners();
  }

  void updateQuantity(String variantId, int quantity) {
    final index = _items.indexWhere((item) => item.variantId == variantId);
    if (index >= 0) {
      if (quantity <= 0) {
        removeItem(variantId);
      } else if (quantity <= _items[index].stock) {
        _items[index].quantity = quantity;
        _saveCart();
        notifyListeners();
      }
    }
  }

  void clearCart() {
    _items.clear();
    _saveCart();
    notifyListeners();
  }

  bool isInCart(String variantId) {
    return _items.any((item) => item.variantId == variantId);
  }

  int getQuantity(String variantId) {
    final item = _items.firstWhere(
      (item) => item.variantId == variantId,
      orElse: () => CartItem(
        variantId: '',
        productId: '',
        title: '',
        image: '',
        size: '',
        price: 0,
        quantity: 0,
        stock: 0,
      ),
    );
    return item.quantity;
  }
}
