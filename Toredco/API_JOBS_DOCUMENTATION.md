# API Jobs Documentation

## Tổng quan
Hệ thống đã được tách thành 2 API riêng biệt để quản lý việc làm:

### 1. API Việc làm mới nhất: `/api/jobs/new`

**Endpoint:** `GET /api/jobs/new`

**Mô tả:** Lấy 5 việc làm mới nhất được đăng

**Response:**
```json
[
  {
    "id": "string",
    "title": "string",
    "company": "string",
    "location": "string",
    "type": "string",
    "salary": "string",
    "description": "string",
    "requirements": ["string"],
    "benefits": ["string"],
    "postedDate": "string",
    "deadline": "string",
    "status": "active"
  }
]
```

**Sử dụng:** 
- Hiển thị việc làm mới nhất trên trang chủ
- Component JobList và FreelancerList

### 2. API Tất cả việc làm: `/api/jobs`

**Endpoint:** `GET /api/jobs`

**Mô tả:** Lấy tất cả việc làm với phân trang và tìm kiếm

**Query Parameters:**
- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng việc làm mỗi trang (mặc định: 10)
- `search` (optional): Tìm kiếm theo tiêu đề, công ty, mô tả
- `type` (optional): Lọc theo loại việc làm
- `location` (optional): Lọc theo địa điểm

**Ví dụ:**
```
GET /api/jobs?page=1&limit=10&search=developer&type=fulltime&location=Hanoi
```

**Response:**
```json
{
  "jobs": [
    {
      "id": "string",
      "title": "string",
      "company": "string",
      "location": "string",
      "type": "string",
      "salary": "string",
      "description": "string",
      "requirements": ["string"],
      "benefits": ["string"],
      "postedDate": "string",
      "deadline": "string",
      "status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

**Sử dụng:**
- Trang danh sách tất cả việc làm
- Tìm kiếm và lọc việc làm
- Phân trang

## Cập nhật Components

### JobList Component
- Sử dụng `/api/jobs/new` để lấy việc làm mới nhất
- Hiển thị trên trang chủ

### FreelancerList Component  
- Sử dụng `/api/jobs/new` để lấy việc làm mới nhất
- Hiển thị trong sidebar hoặc section riêng

### Jobs Page
- Sử dụng `/api/jobs` với phân trang
- Hỗ trợ tìm kiếm và lọc

## Lợi ích của việc tách API

1. **Hiệu suất tốt hơn:** API việc làm mới nhất chỉ trả về 5 kết quả, load nhanh hơn
2. **Tách biệt chức năng:** Mỗi API có mục đích rõ ràng
3. **Dễ bảo trì:** Có thể tối ưu từng API riêng biệt
4. **Linh hoạt:** API chính hỗ trợ nhiều tính năng như tìm kiếm, lọc, phân trang 