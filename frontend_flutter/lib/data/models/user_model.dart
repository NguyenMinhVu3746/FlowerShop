class User {
  final String id;
  final String email;
  final String phone;
  final String fullname;
  final String? avatar;
  final String? birthday;
  final String? gender;
  final String role;
  final String createdAt;

  User({
    required this.id,
    required this.email,
    required this.phone,
    required this.fullname,
    this.avatar,
    this.birthday,
    this.gender,
    required this.role,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      phone: json['phone'],
      fullname: json['fullname'],
      avatar: json['avatar'],
      birthday: json['birthday'],
      gender: json['gender'],
      role: json['role'],
      createdAt: json['createdAt'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'phone': phone,
      'fullname': fullname,
      'avatar': avatar,
      'birthday': birthday,
      'gender': gender,
      'role': role,
      'createdAt': createdAt,
    };
  }
}

class Address {
  final String id;
  final String userId;
  final String title;
  final String fullAddress;
  final String ward;
  final String district;
  final String province;
  final String phoneReceiver;
  final String nameReceiver;
  final bool isDefault;

  Address({
    required this.id,
    required this.userId,
    required this.title,
    required this.fullAddress,
    required this.ward,
    required this.district,
    required this.province,
    required this.phoneReceiver,
    required this.nameReceiver,
    required this.isDefault,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: json['id'],
      userId: json['userId'],
      title: json['title'],
      fullAddress: json['fullAddress'],
      ward: json['ward'],
      district: json['district'],
      province: json['province'],
      phoneReceiver: json['phoneReceiver'],
      nameReceiver: json['nameReceiver'],
      isDefault: json['isDefault'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'title': title,
      'fullAddress': fullAddress,
      'ward': ward,
      'district': district,
      'province': province,
      'phoneReceiver': phoneReceiver,
      'nameReceiver': nameReceiver,
      'isDefault': isDefault,
    };
  }
}
