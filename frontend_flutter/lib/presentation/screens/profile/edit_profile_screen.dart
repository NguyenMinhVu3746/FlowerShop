import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'dart:io';
import '../../../data/services/user_service.dart';
import '../../../providers/auth_provider.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/app_utils.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final UserService _userService = UserService();
  final ImagePicker _picker = ImagePicker();

  late TextEditingController _fullnameController;
  late TextEditingController _phoneController;
  late TextEditingController _birthdayController;

  String? _selectedGender;
  File? _imageFile;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().user;
    _fullnameController = TextEditingController(text: user?.fullname ?? '');
    _phoneController = TextEditingController(text: user?.phone ?? '');
    _birthdayController = TextEditingController(text: user?.birthday ?? '');
    _selectedGender = user?.gender;
  }

  @override
  void dispose() {
    _fullnameController.dispose();
    _phoneController.dispose();
    _birthdayController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      setState(() {
        _imageFile = File(image.path);
      });
    }
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() {
        _birthdayController.text =
            "${picked.day.toString().padLeft(2, '0')}/${picked.month.toString().padLeft(2, '0')}/${picked.year}";
      });
    }
  }

  Future<void> _updateProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final oldAvatar = context.read<AuthProvider>().user?.avatar;

      await _userService.updateProfile(
        fullname: _fullnameController.text,
        phone: _phoneController.text,
        birthday: _birthdayController.text,
        gender: _selectedGender,
        avatarFile: _imageFile,
      );

      // Clear old avatar cache
      if (_imageFile != null && oldAvatar != null) {
        await CachedNetworkImage.evictFromCache(
          AppUtils.getImageUrl(oldAvatar),
        );
      }

      // Reload user data
      await context.read<AuthProvider>().loadUser();

      // Clear new avatar cache to force reload
      if (_imageFile != null) {
        final newAvatar = context.read<AuthProvider>().user?.avatar;
        if (newAvatar != null) {
          await CachedNetworkImage.evictFromCache(
            AppUtils.getImageUrl(newAvatar),
          );
        }
      }

      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Cập nhật thành công')));
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Lỗi: $e')));
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chỉnh sửa thông tin'),
        actions: [
          TextButton(
            onPressed: _isLoading ? null : _updateProfile,
            child: _isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Lưu'),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              // Avatar
              GestureDetector(
                onTap: _pickImage,
                child: Stack(
                  children: [
                    CircleAvatar(
                      radius: 50,
                      backgroundImage: _imageFile != null
                          ? FileImage(_imageFile!)
                          : (user?.avatar != null
                                    ? CachedNetworkImageProvider(
                                        AppUtils.getImageUrl(user!.avatar!),
                                      )
                                    : null)
                                as ImageProvider?,
                      child: _imageFile == null && user?.avatar == null
                          ? Text(
                              (user?.fullname ?? 'U')
                                  .substring(0, 1)
                                  .toUpperCase(),
                              style: const TextStyle(fontSize: 32),
                            )
                          : null,
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.camera_alt,
                          size: 20,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Fullname
              TextFormField(
                controller: _fullnameController,
                decoration: const InputDecoration(
                  labelText: 'Họ và tên',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.person),
                ),
                validator: (value) {
                  if (value?.isEmpty ?? true) return 'Vui lòng nhập họ tên';
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Phone
              TextFormField(
                controller: _phoneController,
                decoration: const InputDecoration(
                  labelText: 'Số điện thoại',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.phone),
                ),
                keyboardType: TextInputType.phone,
                validator: (value) {
                  if (value?.isEmpty ?? true)
                    return 'Vui lòng nhập số điện thoại';
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Birthday
              TextFormField(
                controller: _birthdayController,
                decoration: const InputDecoration(
                  labelText: 'Ngày sinh',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.cake),
                ),
                readOnly: true,
                onTap: _selectDate,
              ),
              const SizedBox(height: 16),

              // Gender
              DropdownButtonFormField<String>(
                value: _selectedGender,
                decoration: const InputDecoration(
                  labelText: 'Giới tính',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.people),
                ),
                items: const [
                  DropdownMenuItem(value: 'male', child: Text('Nam')),
                  DropdownMenuItem(value: 'female', child: Text('Nữ')),
                  DropdownMenuItem(value: 'other', child: Text('Khác')),
                ],
                onChanged: (value) {
                  setState(() => _selectedGender = value);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
