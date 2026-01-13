import 'dart:async';
import 'dart:io';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:device_info_plus/device_info_plus.dart';

class AIVideoScreen extends StatefulWidget {
  const AIVideoScreen({super.key});

  @override
  State<AIVideoScreen> createState() => _AIVideoScreenState();
}

class _AIVideoScreenState extends State<AIVideoScreen> {
  CameraController? _controller;
  List<CameraDescription>? _cameras;
  bool _isInitialized = false;
  bool _isDetecting = false;
  bool _isRecording = false;
  
  // Kết quả nhận diện
  Map<String, int> _detectedCounts = {};
  DateTime? _lastDetectionTime;
  
  // IP configuration
  final String myLaptopIp = "192.168.1.9";

  // Bảng giá hoa
  final Map<String, Map<String, dynamic>> flowerPriceList = {
    'Hoa cuc hoa mi':    {'name': 'Cúc Họa Mi',      'price': 5000},
    'Hoa huong duong':   {'name': 'Hoa Hướng Dương', 'price': 25000},
    'Hoa hong':          {'name': 'Hoa Hồng',        'price': 22000},
    'Hoa ly':            {'name': 'Hoa Ly',          'price': 35000},
    'Hoa tulip':         {'name': 'Hoa Tulip',       'price': 45000},
    'Hoa dong tien':     {'name': 'Hoa Đồng Tiền',   'price': 30000},
  };

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras != null && _cameras!.isNotEmpty) {
        _controller = CameraController(
          _cameras![0],
          ResolutionPreset.high,
          enableAudio: false,
          imageFormatGroup: ImageFormatGroup.jpeg,
        );

        await _controller!.initialize();
        
        if (mounted) {
          setState(() {
            _isInitialized = true;
          });
        }
      }
    } catch (e) {
      print('❌ Error initializing camera: $e');
      _showMsg('Lỗi khởi tạo camera: $e');
    }
  }

  Future<String> _getApiUrl() async {
    if (!Platform.isAndroid) return "http://localhost:8000/predict";

    final deviceInfo = DeviceInfoPlugin();
    final androidInfo = await deviceInfo.androidInfo;

    if (androidInfo.isPhysicalDevice) {
      return "http://$myLaptopIp:8000/predict";
    } else {
      return "http://10.0.2.2:8000/predict";
    }
  }

  void _startDetection() {
    if (!_isInitialized || _controller == null) return;
    
    setState(() {
      _isRecording = true;
    });

    // Gửi frame mỗi 2 giây để tránh quá tải
    Timer.periodic(const Duration(seconds: 2), (timer) {
      if (!_isRecording || !mounted) {
        timer.cancel();
        return;
      }
      _captureAndDetect();
    });
  }

  void _stopDetection() {
    setState(() {
      _isRecording = false;
      _detectedCounts = {};
    });
  }

  Future<void> _captureAndDetect() async {
    if (_isDetecting || _controller == null || !_controller!.value.isInitialized) {
      return;
    }

    setState(() {
      _isDetecting = true;
    });

    try {
      final image = await _controller!.takePicture();
      await _uploadImage(File(image.path));
    } catch (e) {
      print('❌ Error capturing frame: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isDetecting = false;
        });
      }
    }
  }

  Future<void> _uploadImage(File imageFile) async {
    try {
      String url = await _getApiUrl();
      var request = http.MultipartRequest('POST', Uri.parse(url));
      request.files.add(await http.MultipartFile.fromPath('file', imageFile.path));

      var response = await request.send();
      
      if (response.statusCode == 200) {
        var responseData = await response.stream.bytesToString();
        var json = jsonDecode(responseData);

        if (json['success'] == true) {
          Map<String, dynamic> data = json['data'];
          
          if (mounted) {
            setState(() {
              _detectedCounts = Map<String, int>.from(data);
              _lastDetectionTime = DateTime.now();
            });
          }
        }
      }
    } catch (e) {
      print('❌ Error uploading: $e');
    }
  }

  String formatCurrency(num amount) {
    final format = NumberFormat("#,###", "vi_VN");
    return "${format.format(amount)}đ";
  }

  double get _totalPrice {
    double total = 0;
    _detectedCounts.forEach((key, count) {
      if (flowerPriceList.containsKey(key)) {
        total += (flowerPriceList[key]!['price'] as int) * count;
      }
    });
    return total;
  }

  void _showMsg(String msg) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Quét Video Real-time',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      body: _isInitialized
          ? Stack(
              children: [
                // Camera Preview
                Positioned.fill(
                  child: CameraPreview(_controller!),
                ),

                // Recording indicator
                if (_isRecording)
                  Positioned(
                    top: 16,
                    right: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'ĐANG QUÉT',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                // Detection results overlay
                if (_detectedCounts.isNotEmpty && _isRecording)
                  Positioned(
                    left: 16,
                    right: 16,
                    bottom: 100,
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.8),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white.withOpacity(0.3)),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '🌸 Phát hiện:',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 8),
                          ..._detectedCounts.entries.map((entry) {
                            String aiKey = entry.key;
                            int count = entry.value;
                            var info = flowerPriceList[aiKey];
                            String displayName = info != null ? info['name'] : aiKey;
                            int price = info != null ? info['price'] : 0;

                            if (info == null) return const SizedBox();

                            return Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Row(
                                children: [
                                  const Icon(Icons.local_florist, 
                                    color: Colors.pink, size: 20),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      '$displayName x$count',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ),
                                  Text(
                                    formatCurrency(price * count),
                                    style: const TextStyle(
                                      color: Colors.greenAccent,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                          const Divider(color: Colors.white30, height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Tổng cộng:',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                              Text(
                                formatCurrency(_totalPrice),
                                style: const TextStyle(
                                  color: Colors.yellow,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                // Control buttons
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 20,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Stop button
                      if (_isRecording)
                        GestureDetector(
                          onTap: _stopDetection,
                          child: Container(
                            width: 70,
                            height: 70,
                            decoration: BoxDecoration(
                              color: Colors.red,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.red.withOpacity(0.5),
                                  blurRadius: 20,
                                  spreadRadius: 5,
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.stop,
                              color: Colors.white,
                              size: 40,
                            ),
                          ),
                        ),

                      // Start button
                      if (!_isRecording)
                        GestureDetector(
                          onTap: _startDetection,
                          child: Container(
                            width: 70,
                            height: 70,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.pink, width: 4),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.pink.withOpacity(0.5),
                                  blurRadius: 20,
                                  spreadRadius: 5,
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.videocam,
                              color: Colors.pink,
                              size: 40,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),

                // Loading indicator
                if (_isDetecting)
                  Positioned(
                    top: 60,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          '🔍 Đang phân tích...',
                          style: TextStyle(color: Colors.white),
                        ),
                      ),
                    ),
                  ),
              ],
            )
          : const Center(
              child: CircularProgressIndicator(color: Colors.white),
            ),
    );
  }
}
