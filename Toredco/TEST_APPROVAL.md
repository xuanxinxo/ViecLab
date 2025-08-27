# Test Hệ thống Phê duyệt

## Bước 1: Kiểm tra trạng thái hiện tại

### 1.1 Kiểm tra database
```bash
# Kiểm tra jobs trong database
# Tất cả jobs mới tạo phải có status = 'pending'
```

### 1.2 Kiểm tra API
```bash
# API public chỉ trả về jobs có status = 'active'
curl http://localhost:3000/api/jobs

# API admin trả về tất cả jobs
curl http://localhost:3000/api/admin/jobs \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Bước 2: Test quy trình phê duyệt

### 2.1 Tạo job mới
1. Đăng nhập admin: `/admin/login`
2. Tạo job mới: `/admin/jobs/create`
3. Kiểm tra job có status = 'pending'

### 2.2 Phê duyệt job
1. Vào trang quản lý: `/admin/jobs`
2. Lọc theo "Chờ duyệt"
3. Nhấn nút "Duyệt"
4. Kiểm tra job chuyển sang status = 'active'

### 2.3 Kiểm tra hiển thị trên website
1. Vào trang chủ: `/`
2. Job đã phê duyệt phải hiển thị
3. Job chưa phê duyệt không được hiển thị

## Bước 3: Test NewJobs

### 3.1 Tạo NewJob mới
1. Tạo job mới: `/admin/jobnew/create`
2. Kiểm tra status = 'pending'

### 3.2 Phê duyệt NewJob
1. Vào trang quản lý: `/admin/jobnew`
2. Phê duyệt job
3. Kiểm tra hiển thị trên website

## Bước 4: Test các trường hợp đặc biệt

### 4.1 Job không được phê duyệt
- Tạo job với status = 'pending'
- Kiểm tra không hiển thị trên website
- Kiểm tra không hiển thị trong API public

### 4.2 Job bị từ chối
- Tạo job với status = 'rejected'
- Kiểm tra không hiển thị trên website

### 4.3 Job hết hạn
- Tạo job với status = 'expired'
- Kiểm tra không hiển thị trên website

## Bước 5: Test bảo mật

### 5.1 API public
```bash
# Chỉ trả về jobs có status = 'active'
curl http://localhost:3000/api/jobs
curl http://localhost:3000/api/newjobs
```

### 5.2 API admin
```bash
# Yêu cầu authentication
curl http://localhost:3000/api/admin/jobs
# Phải trả về 401 Unauthorized

# Với token hợp lệ
curl http://localhost:3000/api/admin/jobs \
  -H "Authorization: Bearer VALID_TOKEN"
```

## Bước 6: Test frontend components

### 6.1 JobList component
- Gọi `/api/jobs?limit=5`
- Chỉ hiển thị jobs có status = 'active'

### 6.2 NewJobList component
- Gọi `/api/newjobs?limit=5`
- Chỉ hiển thị newjobs có status = 'active'

### 6.3 SpecialJobList component
- Gọi `/api/newjobs?limit=4`
- Chỉ hiển thị newjobs có status = 'active'

## Kết quả mong đợi

✅ **Jobs mới tạo có status = 'pending'**
✅ **Chỉ jobs có status = 'active' hiển thị trên website**
✅ **Admin có thể phê duyệt jobs**
✅ **API public chỉ trả về jobs đã phê duyệt**
✅ **API admin yêu cầu authentication**
✅ **Frontend components chỉ hiển thị jobs đã phê duyệt**

## Troubleshooting

### Nếu jobs vẫn hiển thị mà không cần phê duyệt:
1. Kiểm tra API calls trong browser console
2. Kiểm tra database có jobs với status = 'pending'
3. Kiểm tra API response có đúng format không

### Nếu không thể phê duyệt:
1. Kiểm tra admin token có hợp lệ không
2. Kiểm tra API admin có hoạt động không
3. Kiểm tra database connection

### Nếu API trả về lỗi:
1. Kiểm tra Prisma schema
2. Kiểm tra database connection
3. Kiểm tra environment variables 