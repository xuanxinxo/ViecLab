# Hệ thống Phê duyệt Việc làm - TOREDCO Jobs

## Tổng quan
Hệ thống phê duyệt đảm bảo rằng tất cả việc làm được đăng lên website đều phải được admin phê duyệt trước khi hiển thị cho người dùng.

## Quy trình hoạt động

### 1. Tạo việc làm mới
- Admin tạo việc làm mới thông qua form
- Hệ thống tự động đặt trạng thái `pending` (chờ duyệt)
- Việc làm chưa hiển thị trên website

### 2. Phê duyệt việc làm
- Admin xem danh sách việc làm chờ duyệt
- Nhấn nút "Duyệt" để chuyển trạng thái thành `active`
- Việc làm sẽ hiển thị ngay trên website

### 3. Quản lý trạng thái
- **pending**: Chờ duyệt (không hiển thị trên website)
- **active**: Đã phê duyệt (hiển thị trên website)
- **expired**: Hết hạn (không hiển thị)
- **deleted**: Đã xóa (không hiển thị)

## API Endpoints

### Jobs (việc làm thông thường)
- `GET /api/jobs` - Lấy việc làm đã phê duyệt (status=active)
- `POST /api/jobs` - Tạo việc làm mới (status=pending)
- `GET /api/admin/jobs` - Admin: Lấy tất cả việc làm
- `PUT /api/admin/jobs/[id]` - Admin: Cập nhật trạng thái
- `DELETE /api/admin/jobs/[id]` - Admin: Xóa việc làm

### NewJobs (việc làm mới)
- `GET /api/newjobs` - Lấy việc làm mới đã phê duyệt (status=active)
- `POST /api/admin/newjobs` - Tạo việc làm mới (status=pending)
- `GET /api/admin/newjobs` - Admin: Lấy tất cả việc làm mới
- `PUT /api/admin/newjobs/[id]` - Admin: Cập nhật trạng thái
- `DELETE /api/admin/newjobs/[id]` - Admin: Xóa việc làm

## Giao diện Admin

### Dashboard chính (`/admin`)
- Hiển thị thống kê: Tổng số, Đang hoạt động, Chờ duyệt, Hết hạn
- Truy cập nhanh đến quản lý việc làm

### Quản lý việc làm (`/admin/jobs`)
- Lọc theo trạng thái: Tất cả, Đang hoạt động, Chờ duyệt, Hết hạn
- Thao tác: Sửa, Duyệt (cho việc làm pending), Xóa

### Quản lý việc làm mới (`/admin/jobnew`)
- Tương tự như quản lý việc làm thông thường
- Hỗ trợ thêm các trường: tags, isRemote

## Bảo mật

### Authentication
- Tất cả API admin yêu cầu JWT token
- Token được lưu trong localStorage
- Tự động redirect về login nếu chưa đăng nhập

### Authorization
- Chỉ admin mới có quyền phê duyệt
- Frontend chỉ hiển thị việc làm có status=active
- API public chỉ trả về việc làm đã phê duyệt

## Cấu trúc Database

### Job Model
```prisma
model Job {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  title        String
  company      String
  location     String
  type         String
  salary       String
  description  String
  requirements String[]
  benefits     String[]
  deadline     DateTime @db.Date
  postedDate   DateTime @db.Date
  status       String   // pending, active, expired, deleted
}
```

### NewJob Model
```prisma
model NewJob {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  title        String
  company      String
  location     String
  type         String
  salary       String
  description  String
  requirements String[]
  benefits     String[]
  deadline     DateTime @db.Date
  postedDate   DateTime @db.Date
  createdAt    DateTime @db.Date
  status       String   // pending, active, expired, deleted
  tags         String[]
  isRemote     Boolean
}
```

## Hướng dẫn sử dụng

### 1. Đăng nhập Admin
```
URL: /admin/login
Username: admin
Password: admin123
```

### 2. Tạo việc làm mới
1. Truy cập `/admin/jobs/create` hoặc `/admin/jobnew/create`
2. Điền đầy đủ thông tin bắt buộc
3. Nhấn "Tạo việc làm"
4. Việc làm sẽ có trạng thái "Chờ duyệt"

### 3. Phê duyệt việc làm
1. Truy cập `/admin/jobs` hoặc `/admin/jobnew`
2. Lọc theo trạng thái "Chờ duyệt"
3. Nhấn nút "Duyệt" bên cạnh việc làm cần phê duyệt
4. Việc làm sẽ hiển thị ngay trên website

### 4. Quản lý việc làm
- **Sửa**: Chỉnh sửa thông tin việc làm
- **Duyệt**: Chuyển từ pending sang active
- **Xóa**: Soft delete (chuyển status thành deleted)

## Lưu ý quan trọng

1. **Tất cả việc làm mới đều cần phê duyệt** - Không có ngoại lệ
2. **Frontend chỉ hiển thị việc làm active** - Đảm bảo chất lượng nội dung
3. **Soft delete** - Việc làm bị xóa vẫn còn trong database với status=deleted
4. **Real-time update** - Thay đổi trạng thái ảnh hưởng ngay đến website

## Troubleshooting

### Việc làm không hiển thị trên website
- Kiểm tra trạng thái có phải là "active" không
- Kiểm tra deadline có hết hạn chưa
- Kiểm tra API có trả về đúng dữ liệu không

### Không thể phê duyệt
- Kiểm tra đã đăng nhập admin chưa
- Kiểm tra token có hợp lệ không
- Kiểm tra console để xem lỗi API

### Lỗi database
- Kiểm tra kết nối MongoDB
- Kiểm tra schema có đúng không
- Kiểm tra quyền truy cập database 