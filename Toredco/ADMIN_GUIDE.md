# Hướng dẫn sử dụng Admin Dashboard - TOREDCO Jobs

## Tổng quan
Admin Dashboard cho phép quản lý việc làm trên website TOREDCO Jobs. Khi admin đăng việc làm và phê duyệt, nó sẽ tự động hiển thị trên trang chủ.

## Đăng nhập Admin

### Thông tin đăng nhập
- **URL**: `/admin/login`
- **Username**: `admin`
- **Password**: `admin123`

### Quy trình đăng nhập
1. Truy cập `/admin/login`
2. Nhập username và password
3. Hệ thống sẽ lưu token vào localStorage
4. Chuyển hướng đến dashboard

## Dashboard chính (`/admin`)

### Thống kê tổng quan
- **Tổng số việc làm**: Hiển thị tất cả việc làm đã đăng
- **Việc làm đang hoạt động**: Việc làm có status = 'active'
- **Việc làm chờ duyệt**: Việc làm có status = 'pending'
- **Việc làm hết hạn**: Việc làm có status = 'expired'

### Truy cập nhanh
- **Quản lý việc làm**: Chuyển đến trang danh sách việc làm
- **Đăng việc làm mới**: Tạo việc làm mới

## Quản lý việc làm (`/admin/jobs`)

### Tính năng chính
1. **Xem danh sách**: Hiển thị tất cả việc làm với thông tin cơ bản
2. **Lọc theo trạng thái**: 
   - Tất cả
   - Đang hoạt động (active)
   - Chờ duyệt (pending)
   - Hết hạn (expired)
3. **Thao tác với việc làm**:
   - **Sửa**: Chỉnh sửa thông tin việc làm
   - **Duyệt**: Chuyển từ pending sang active
   - **Xóa**: Soft delete (chuyển status thành deleted)

### Quy trình phê duyệt
1. Admin tạo việc làm mới → status = 'active'
2. Việc làm sẽ hiển thị ngay trên trang chủ
3. Có thể thay đổi status để ẩn/hiện việc làm

## Đăng việc làm mới (`/admin/jobs/create`)

### Thông tin bắt buộc
- **Tiêu đề việc làm**: Tên công việc
- **Công ty**: Tên công ty tuyển dụng
- **Địa điểm**: Nơi làm việc
- **Loại việc làm**: Full-time, Part-time, Freelance, Internship
- **Mức lương**: Thông tin lương thưởng
- **Hạn nộp hồ sơ**: Deadline ứng tuyển
- **Mô tả công việc**: Chi tiết về công việc

### Thông tin tùy chọn
- **Yêu cầu công việc**: Danh sách yêu cầu (có thể thêm/xóa)
- **Quyền lợi**: Danh sách quyền lợi (có thể thêm/xóa)

### Quy trình tạo
1. Điền đầy đủ thông tin bắt buộc
2. Thêm yêu cầu và quyền lợi (tùy chọn)
3. Nhấn "Tạo việc làm"
4. Hệ thống hiển thị thông báo thành công
5. Tự động chuyển về trang quản lý sau 2 giây

## Kết nối với trang chủ

### Cách hoạt động
1. **Shared Data**: Tất cả việc làm được lưu trong shared data (jobs array)
2. **API Integration**: Trang chủ sử dụng API `/api/jobs?status=active` để lấy việc làm
3. **Real-time Update**: Khi admin tạo/sửa/xóa việc làm, nó sẽ ảnh hưởng ngay đến trang chủ

### API Endpoints
- `GET /api/jobs` - Lấy danh sách việc làm (có filter theo status)
- `GET /api/jobs/[id]` - Lấy chi tiết việc làm
- `POST /api/admin/jobs` - Tạo việc làm mới (admin only)
- `PUT /api/admin/jobs/[id]` - Cập nhật việc làm (admin only)
- `DELETE /api/admin/jobs/[id]` - Xóa việc làm (admin only)

### Trạng thái việc làm
- **active**: Hiển thị trên trang chủ
- **pending**: Chờ duyệt (không hiển thị)
- **expired**: Hết hạn (không hiển thị)
- **deleted**: Đã xóa (không hiển thị)

## Bảo mật

### Authentication
- Sử dụng JWT token (mock implementation)
- Token được lưu trong localStorage
- Tự động redirect về login nếu chưa đăng nhập

### Authorization
- Chỉ admin mới có quyền truy cập
- Tất cả API admin đều yêu cầu authentication
- Middleware kiểm tra role 'admin'

## Troubleshooting

### Lỗi thường gặp
1. **"Unauthorized"**: Chưa đăng nhập hoặc token hết hạn
2. **"Job not found"**: ID việc làm không tồn tại
3. **"Missing required fields"**: Thiếu thông tin bắt buộc

### Cách khắc phục
1. Đăng nhập lại nếu gặp lỗi authentication
2. Kiểm tra lại thông tin khi tạo/sửa việc làm
3. Refresh trang nếu dữ liệu không cập nhật

## Tính năng nâng cao (có thể phát triển thêm)

### Quản lý người dùng
- Quản lý tài khoản freelancer
- Quản lý tài khoản employer
- Phân quyền người dùng

### Quản lý đánh giá
- Duyệt đánh giá từ người dùng
- Xóa đánh giá không phù hợp
- Thống kê đánh giá

### Upload file
- Upload logo công ty
- Upload hình ảnh việc làm
- Quản lý file đính kèm

### Analytics
- Thống kê lượt xem việc làm
- Báo cáo ứng tuyển
- Dashboard analytics chi tiết

### Email notifications
- Thông báo khi có việc làm mới
- Email xác nhận ứng tuyển
- Newsletter cho người dùng

## Lưu ý quan trọng

1. **Dữ liệu hiện tại**: Sử dụng mock data, sẽ mất khi restart server
2. **Production**: Cần tích hợp database thực tế
3. **Security**: Cần implement JWT thực tế và hash password
4. **Validation**: Cần thêm validation chi tiết hơn
5. **Error handling**: Cần xử lý lỗi tốt hơn

## Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra console browser để xem lỗi
2. Kiểm tra network tab để xem API calls
3. Đảm bảo đã đăng nhập với quyền admin
4. Refresh trang và thử lại 

## 1. **Cấu trúc bảng jobs trong MySQL**

Bạn cần tạo bảng `jobs` như sau (có thể chạy trong phpMyAdmin):

```sql
CREATE TABLE jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  salary VARCHAR(100),
  description TEXT,
  requirements TEXT, -- Lưu dạng JSON string
  benefits TEXT,     -- Lưu dạng JSON string
  postedDate DATE,
  deadline DATE,
  status VARCHAR(50) DEFAULT 'active'
);
```

## 2. **File kết nối MySQL**

**src/lib/db.ts**
```typescript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vieclab',
});

export default pool;
```

## 3. **API: Lấy danh sách việc làm**

**src/app/api/jobs/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const [rows] = await pool.query('SELECT * FROM jobs WHERE status = "active" ORDER BY postedDate DESC');
    // Parse requirements, benefits từ JSON string về array
    const jobs = rows.map((job: any) => ({
      ...job,
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      benefits: job.benefits ? JSON.parse(job.benefits) : [],
    }));
    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
```

## 4. **API: Tạo việc làm mới**

**src/app/api/admin/jobs/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAdminFromRequest } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = getAdminFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.title || !body.company || !body.location) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const [result] = await pool.query(
      'INSERT INTO jobs (title, company, location, type, salary, description, requirements, benefits, postedDate, deadline, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, "active")',
      [
        body.title,
        body.company,
        body.location,
        body.type,
        body.salary,
        body.description,
        JSON.stringify(body.requirements || []),
        JSON.stringify(body.benefits || []),
        body.deadline
      ]
    );

    return NextResponse.json({ success: true, message: 'Job created successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
```

## 5. **.env cấu hình kết nối MySQL (trên server và local)**

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=vieclab
```

## 6. **Lưu ý khi deploy**

- Đảm bảo file `.env` trên server đúng thông tin kết nối MySQL.
- Deploy lại code lên server.
- Nếu dùng Vercel/Netlify, DB_HOST không phải là `localhost` mà là IP hoặc domain của MySQL server.

## 7. **Mở rộng: Lấy chi tiết, sửa, xóa việc làm**

Bạn chỉ cần query/update/delete từ bảng `jobs` tương tự như trên.

**Bạn hãy thay thế code API hiện tại bằng các đoạn trên, deploy lại, và kiểm tra! Nếu gặp lỗi, gửi log hoặc ảnh chụp, tôi sẽ hỗ trợ tiếp nhé!** 