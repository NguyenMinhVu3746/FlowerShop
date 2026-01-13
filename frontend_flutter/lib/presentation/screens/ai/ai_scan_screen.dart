import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'dart:io' show Platform;
import 'ai_video_screen.dart';

class AiScanScreen extends StatefulWidget {
  const AiScanScreen({super.key});

  @override
  State<AiScanScreen> createState() => _AiScanScreenState();
}

class _AiScanScreenState extends State<AiScanScreen> {
  File? _image;
  final picker = ImagePicker();
  bool _isLoading = false;

  // Biến lưu kết quả từ Server trả về
  Map<String, int> _detectedCounts = {}; 

  // --- CẤU HÌNH IP TỰ ĐỘNG ---
  // ✅ IP LAN máy tính (từ ipconfig Wi-Fi): 192.168.1.9
  final String myLaptopIp = "192.168.1.9"; 

  // Hàm lấy URL API dựa trên thiết bị đang chạy
  Future<String> _getApiUrl() async {
    // Nếu không phải Android (ví dụ chạy trên Web hoặc iOS Simulator)
    if (!Platform.isAndroid) return "http://localhost:8000/predict";

    final deviceInfo = DeviceInfoPlugin();
    final androidInfo = await deviceInfo.androidInfo;

    // Kiểm tra: Nếu là thiết bị vật lý (Điện thoại thật) -> Dùng IP LAN
    if (androidInfo.isPhysicalDevice) {
      debugPrint("Đang chạy trên điện thoại thật. Dùng IP: $myLaptopIp");
      return "http://$myLaptopIp:8000/predict";
    } 
    // Nếu là máy ảo (Emulator) -> Dùng 10.0.2.2
    else {
      debugPrint("Đang chạy trên máy ảo. Dùng IP: 10.0.2.2");
      return "http://10.0.2.2:8000/predict";
    }
  }

  // --- BẢNG GIÁ (Mapping Tên từ Python -> Giá tiền VNĐ) ---
  final Map<String, Map<String, dynamic>> flowerPriceList = {
    'Hoa cuc hoa mi':    {'name': 'Cúc Họa Mi',      'price': 5000},
    'Hoa huong duong':   {'name': 'Hoa Hướng Dương', 'price': 25000},
    'Hoa hong':          {'name': 'Hoa Hồng',        'price': 22000},
    'Hoa ly':            {'name': 'Hoa Ly',          'price': 35000},
    'Hoa tulip':         {'name': 'Hoa Tulip',       'price': 45000},
    'Hoa dong tien':     {'name': 'Hoa Đồng Tiền',   'price': 30000},
  };

  // Hàm format tiền (25000 -> 25.000đ)
  String formatCurrency(num amount) {
    final format = NumberFormat("#,###", "vi_VN");
    return "${format.format(amount)}đ";
  }

  // Chọn ảnh
  Future<void> _pickImage(ImageSource source) async {
    try {
      final pickedFile = await picker.pickImage(
        source: source,
        maxWidth: 1024,  // Giảm kích thước ảnh để xử lý nhanh hơn
        maxHeight: 1024,
        imageQuality: 85, // Chất lượng ảnh 85%
      );
      
      if (pickedFile != null) {
        setState(() {
          _image = File(pickedFile.path);
          _detectedCounts = {}; // Reset kết quả cũ
        });
        await _uploadImage(File(pickedFile.path));
      } else {
        print("📷 User cancelled image picking");
      }
    } catch (e) {
      print("❌ Error picking image: $e");
      _showMsg("Lỗi khi chọn ảnh. Vui lòng kiểm tra quyền Camera/Storage!");
    }
  }

  // Gửi ảnh lên Server AI
  Future<void> _uploadImage(File imageFile) async {
    setState(() {
      _isLoading = true;
    });

    try {
      // 1. Lấy URL động (Tự động chọn IP)
      String url = await _getApiUrl();
      print("Đang gọi API tới: $url");

      var request = http.MultipartRequest('POST', Uri.parse(url));
      request.files.add(await http.MultipartFile.fromPath('file', imageFile.path));

      var response = await request.send();
      
      if (response.statusCode == 200) {
        var responseData = await response.stream.bytesToString();
        var json = jsonDecode(responseData);

        print("📥 Response from AI: $json");

        if (json['success'] == true) {
          Map<String, dynamic> data = json['data'];
          print("🔍 Data received: $data");
          
          // Chuyển đổi dữ liệu về dạng Map<String, int>
          setState(() {
            _detectedCounts = Map<String, int>.from(data);
          });
          
          print("✅ Detected counts: $_detectedCounts");
          
          if (_detectedCounts.isEmpty) {
             _showMsg("Không tìm thấy hoa nào trong ảnh!");
          }
        } else {
           _showMsg("Lỗi phân tích: ${json['error']}");
        }
      } else {
        _showMsg("Lỗi Server: ${response.statusCode}");
      }
    } catch (e) {
      print("Lỗi kết nối: $e");
      _showMsg("Không kết nối được tới Server AI. Hãy kiểm tra IP và Wifi!");
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }
  
  void _showMsg(String msg) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    }
  }

  // Tính tổng tiền
  double get _totalPrice {
    double total = 0;
    _detectedCounts.forEach((key, count) {
      // Chỉ tính tiền nếu loại hoa đó có trong bảng giá
      if (flowerPriceList.containsKey(key)) {
        total += (flowerPriceList[key]!['price'] as int) * count;
      }
    });
    return total;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. LỚP ẢNH NỀN
          Positioned.fill(
            child: _image == null
                ? Container(
                    color: Colors.grey[900],
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.camera_enhance, color: Colors.white54, size: 80),
                        SizedBox(height: 10),
                        Text("Chụp ảnh bó hoa để tính tiền", style: TextStyle(color: Colors.white54))
                      ],
                    ),
                  )
                : Image.file(_image!, fit: BoxFit.cover),
          ),

          // 2. NÚT BACK & VIDEO
          Positioned(
            top: 50,
            left: 20,
            right: 20,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                CircleAvatar(
                  backgroundColor: Colors.black45,
                  child: IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                ),
                CircleAvatar(
                  backgroundColor: Colors.pink.withOpacity(0.8),
                  child: IconButton(
                    icon: const Icon(Icons.videocam, color: Colors.white),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const AIVideoScreen(),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          // 3. LOADING
          if (_isLoading)
            const Center(child: CircularProgressIndicator(color: Colors.white)),

          // 4. BILL THANH TOÁN (Overlay bên dưới)
          if (_detectedCounts.isNotEmpty)
            Align(
              alignment: Alignment.bottomCenter,
              child: Container(
                margin: const EdgeInsets.only(bottom: 100, left: 16, right: 16),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.95),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(color: Colors.black26, blurRadius: 10, spreadRadius: 2)
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "🧾 Hóa đơn tạm tính",
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                    ),
                    const SizedBox(height: 15),
                    
                    // Danh sách chi tiết
                    ..._detectedCounts.entries.map((entry) {
                      String aiKey = entry.key; // Tên từ AI (vd: Hoa huong duong)
                      int count = entry.value;
                      
                      // Lấy thông tin hiển thị
                      var info = flowerPriceList[aiKey];
                      String displayName = info != null ? info['name'] : aiKey;
                      int price = info != null ? info['price'] : 0;

                      // Nếu AI nhận diện ra cái gì lạ không có trong bảng giá thì bỏ qua hoặc hiển thị cảnh báo
                      if (info == null) return const SizedBox(); 

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12.0),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(color: Colors.pink[50], borderRadius: BorderRadius.circular(8)),
                              child: Icon(Icons.local_florist, color: Colors.pink[400], size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(displayName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                                  Text("$count x ${formatCurrency(price)}", style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                                ],
                              ),
                            ),
                            Text(
                              formatCurrency(price * count),
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                          ],
                        ),
                      );
                    }).toList(),

                    const Divider(height: 30),
                    
                    // Tổng cộng
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text("Tổng cộng", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                        Text(
                          formatCurrency(_totalPrice),
                          style: TextStyle(color: Colors.red[700], fontWeight: FontWeight.bold, fontSize: 22),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

          // 5. THANH ĐIỀU KHIỂN (Dưới cùng)
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              color: Colors.black87,
              padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 30),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    onPressed: () => _pickImage(ImageSource.gallery),
                    icon: const Icon(Icons.photo_library, color: Colors.white, size: 30),
                    tooltip: "Thư viện",
                  ),
                  GestureDetector(
                    onTap: () => _pickImage(ImageSource.camera),
                    child: Container(
                      width: 70,
                      height: 70,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 4),
                        color: Colors.transparent,
                      ),
                      child: Container(
                        margin: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () {}, 
                    icon: const Icon(Icons.flash_on, color: Colors.white, size: 30),
                    tooltip: "Flash",
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}