from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
from collections import Counter

app = FastAPI()

# Cấu hình CORS (Để web/app gọi được)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. LOAD MODEL
# Lưu ý: Đường dẫn này trỏ ra ngoài thư mục ai_server để đến thư mục yolo
# Nếu chạy lỗi không thấy file, hãy kiểm tra kỹ đường dẫn tuyệt đối
model_path = "../yolo/my_model/train/weights/best.pt" 

try:
    model = YOLO(model_path)
    print("✅ Đã load model thành công!")
except Exception as e:
    print(f"⚠️ Lỗi load model: {e}")
    print("👉 Đang dùng model mặc định yolov8n.pt để test code...")
    model = YOLO("yolov8n.pt")

# 2. MAPPING TÊN (Lấy từ file yolo_detect.py của bạn)
# Quan trọng: Key ID phải khớp với file data.yaml lúc train
display_names = {
    0: "Hoa cuc hoa mi",
    1: "Hoa huong duong",
    2: "Hoa hong",
    3: "Hoa ly",
    4: "Hoa tulip",
    5: "Hoa dong tien"
}

@app.get("/")
def read_root():
    return {"message": "HOASHOP AI Server is running!"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Đọc ảnh từ client gửi lên
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))

        # Chạy nhận diện với ngưỡng tin cậy thấp để test
        # conf=0.15: Ngưỡng tin cậy 15% - rất thấp để phát hiện nhiều object
        # imgsz=800: Tăng kích thước ảnh để chính xác hơn
        # verbose=True: Hiển thị chi tiết quá trình xử lý
        results = model(image, conf=0.15, imgsz=800, verbose=True)
        
        detected_objects = []
        print(f"📸 Processing image: {image.size}")

        # Duyệt qua các kết quả
        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                confidence = float(box.conf[0])
                
                # Ánh xạ từ ID (0,1,2) sang Tên (Hoa hong, ...)
                # Nếu ID không có trong danh sách display_names, lấy tên gốc của model
                class_name = display_names.get(cls_id, model.names[cls_id])
                
                print(f"✅ Detected: {class_name} (confidence: {confidence:.2f})")
                detected_objects.append(class_name)

        # Đếm số lượng (Ví dụ: {'Hoa huong duong': 5, 'Hoa hong': 2})
        counts = dict(Counter(detected_objects))
        
        print(f"📊 Total detected: {sum(counts.values())} flowers")
        print(f"📋 Details: {counts}")

        return {
            "success": True,
            "data": counts 
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# Lệnh chạy: uvicorn main:app --host 0.0.0.0 --port 8000 --reload