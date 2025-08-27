# Cấu hình Cloudinary để Upload Ảnh

## Vấn đề hiện tại
- Trên local: ảnh upload được và hiển thị bình thường
- Trên server: ảnh không upload được vì file system chỉ đọc

## Giải pháp: Sử dụng Cloudinary

### Bước 1: Đăng ký Cloudinary
1. Truy cập: https://cloudinary.com/
2. Đăng ký tài khoản miễn phí
3. Sau khi đăng nhập, vào Dashboard

### Bước 2: Lấy thông tin cấu hình
Trong Dashboard, bạn sẽ thấy:
- **Cloud Name**: Tên cloud của bạn
- **API Key**: Khóa API
- **API Secret**: Bí mật API

### Bước 3: Cấu hình biến môi trường
Tạo file `.env.local` trong thư mục gốc của project:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# MongoDB Configuration (nếu chưa có)
MONGODB_URI=your_mongodb_connection_string_here
```

### Bước 4: Cấu hình trên Server
Nếu deploy lên Vercel/Netlify, thêm các biến môi trường trong dashboard của họ:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY` 
- `CLOUDINARY_API_SECRET`

### Bước 5: Test
1. Restart server
2. Thử đăng tin tức với ảnh
3. Ảnh sẽ được upload lên Cloudinary và hiển thị bình thường

## Lưu ý
- Cloudinary miễn phí cho 25GB storage và 25GB bandwidth/tháng
- Ảnh sẽ được lưu trong folder "news" trên Cloudinary
- Nếu Cloudinary fail, hệ thống sẽ fallback về lưu local (nếu có thể)

## Troubleshooting
- Nếu vẫn lỗi, kiểm tra console log để xem lỗi cụ thể
- Đảm bảo các biến môi trường đã được cấu hình đúng
- Kiểm tra quyền truy cập API key trên Cloudinary
