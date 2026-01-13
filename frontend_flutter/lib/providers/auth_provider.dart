import 'package:flutter/foundation.dart';
import '../data/models/user_model.dart';
import '../data/services/auth_service.dart';
import '../data/services/user_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();
  final UserService _userService = UserService();

  User? _user;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  AuthProvider() {
    _loadUser();
  }

  Future<void> _loadUser() async {
    _user = await _authService.getCurrentUser();
    notifyListeners();
  }

  Future<void> loadUser() async {
    try {
      print('🔄 AuthProvider: Fetching fresh user data from API...');
      // Fetch fresh user data from API
      final freshUser = await _userService.getProfile();
      print(
        '✅ AuthProvider: Got fresh user data - avatar: ${freshUser.avatar}',
      );
      _user = freshUser;

      // Update local storage
      await _authService.updateLocalUser(freshUser);

      notifyListeners();
      print('✅ AuthProvider: User data updated and notified listeners');
    } catch (e) {
      print('❌ AuthProvider: API failed, using local storage - Error: $e');
      // If API fails, fallback to local storage
      await _loadUser();
    }
  }

  Future<bool> login(String email, String password) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final response = await _authService.login(
        email: email,
        password: password,
      );

      _user = User.fromJson(response['data']['user']);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String fullname,
    required String phone,
  }) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      await _authService.register(
        email: email,
        password: password,
        fullname: fullname,
        phone: phone,
      );

      // Don't set user - require manual login
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
