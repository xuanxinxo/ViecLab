# TOREDCO Jobs API Documentation

## Tổng quan
API này cung cấp các endpoint để quản lý việc làm, freelancers, đánh giá và xác thực người dùng cho nền tảng TOREDCO Jobs.

## Base URL
```
http://localhost:3000/api
```

## Authentication
API sử dụng JWT (JSON Web Token) để xác thực. Token có thể được gửi qua:
- Cookie: `token`
- Authorization header: `Bearer <token>`

## Endpoints

### 1. Authentication

#### Đăng nhập
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "Nguyễn Văn A",
      "role": "user",
      "verified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

#### Đăng ký
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Nguyễn Văn B",
  "role": "user"
}
```

#### Đăng xuất
```http
POST /api/auth/logout
```

### 2. Jobs (Việc làm)

#### Lấy danh sách việc làm
```http
GET /api/jobs?page=1&limit=10&type=Full-time&location=Đà Nẵng&search=nhân viên
```

**Query Parameters:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số lượng item mỗi trang (mặc định: 10)
- `type`: Loại việc làm (Full-time, Part-time)
- `location`: Địa điểm
- `search`: Tìm kiếm theo tiêu đề hoặc công ty

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Nhân viên bán hàng",
      "company": "Cửa hàng ABC",
      "location": "Đà Nẵng",
      "type": "Full-time",
      "salary": "8-12 triệu",
      "description": "Tìm nhân viên bán hàng...",
      "requirements": ["Kinh nghiệm 1 năm", "Giao tiếp tốt"],
      "benefits": ["Lương thưởng hấp dẫn", "Được đào tạo"],
      "postedDate": "2024-02-20",
      "deadline": "2024-03-20",
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

#### Lấy chi tiết việc làm
```http
GET /api/jobs/1
```

#### Tạo việc làm mới
```http
POST /api/jobs
```

**Request Body:**
```json
{
  "title": "Nhân viên bán hàng",
  "company": "Cửa hàng ABC",
  "location": "Đà Nẵng",
  "type": "Full-time",
  "salary": "8-12 triệu",
  "description": "Mô tả công việc...",
  "requirements": ["Yêu cầu 1", "Yêu cầu 2"],
  "benefits": ["Quyền lợi 1", "Quyền lợi 2"],
  "deadline": "2024-03-20"
}
```

#### Cập nhật việc làm
```http
PUT /api/jobs/1
```

#### Xóa việc làm
```http
DELETE /api/jobs/1
```

### 3. Freelancers (Ứng viên)

#### Lấy danh sách freelancers
```http
GET /api/freelancers?page=1&limit=10&skill=Thiết kế&location=Đà Nẵng&minRating=4&search=Nguyễn
```

**Query Parameters:**
- `page`: Số trang
- `limit`: Số lượng item mỗi trang
- `skill`: Kỹ năng
- `location`: Địa điểm
- `minRating`: Đánh giá tối thiểu
- `search`: Tìm kiếm theo tên hoặc mô tả

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Nguyễn Văn A",
      "skill": "Thiết kế",
      "exp": "2 năm",
      "rating": 4.8,
      "completedJobs": 15,
      "description": "Chuyên thiết kế UI/UX...",
      "skills": ["UI/UX Design", "Figma", "Adobe XD"],
      "hourlyRate": "500k-800k",
      "location": "Đà Nẵng"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### Tạo freelancer mới
```http
POST /api/freelancers
```

**Request Body:**
```json
{
  "name": "Nguyễn Văn A",
  "skill": "Thiết kế",
  "description": "Mô tả về bản thân...",
  "skills": ["UI/UX Design", "Figma"],
  "hourlyRate": "500k-800k",
  "location": "Đà Nẵng"
}
```

### 4. Reviews (Đánh giá)

#### Lấy danh sách đánh giá
```http
GET /api/reviews?page=1&limit=10&rating=4&category=employer&verified=true
```

**Query Parameters:**
- `page`: Số trang
- `limit`: Số lượng item mỗi trang
- `rating`: Đánh giá tối thiểu
- `category`: Loại người dùng (employer, freelancer)
- `verified`: Chỉ lấy đánh giá đã xác minh

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Mai H.",
      "role": "Chủ quán cafe",
      "rating": 5,
      "date": "2024-02-15",
      "comment": "Ứng dụng rất dễ dùng...",
      "likes": 12,
      "verified": true,
      "category": "employer"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 30,
    "totalPages": 3
  },
  "stats": {
    "averageRating": 4.6,
    "totalReviews": 30,
    "ratingDistribution": {
      "5": 15,
      "4": 10,
      "3": 3,
      "2": 1,
      "1": 1
    }
  }
}
```

#### Tạo đánh giá mới
```http
POST /api/reviews
```

**Request Body:**
```json
{
  "name": "Nguyễn Văn A",
  "role": "Freelancer",
  "rating": 5,
  "comment": "Nội dung đánh giá...",
  "category": "freelancer"
}
```

## Error Responses

Tất cả API đều trả về response với format thống nhất:

```json
{
  "success": false,
  "message": "Error description"
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Ví dụ sử dụng với JavaScript

### Fetch API
```javascript
// Đăng nhập
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const loginData = await loginResponse.json();

// Lấy danh sách việc làm
const jobsResponse = await fetch('/api/jobs?page=1&limit=10');
const jobsData = await jobsResponse.json();

// Tạo việc làm mới (cần authentication)
const createJobResponse = await fetch('/api/jobs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${loginData.data.token}`
  },
  body: JSON.stringify({
    title: 'Nhân viên bán hàng',
    company: 'Cửa hàng ABC',
    location: 'Đà Nẵng',
    type: 'Full-time',
    salary: '8-12 triệu',
    description: 'Mô tả công việc...'
  })
});
```

### Axios
```javascript
import axios from 'axios';

// Set base URL
axios.defaults.baseURL = 'http://localhost:3000/api';

// Đăng nhập
const login = async (email, password) => {
  const response = await axios.post('/auth/login', { email, password });
  return response.data;
};

// Lấy danh sách việc làm
const getJobs = async (params = {}) => {
  const response = await axios.get('/jobs', { params });
  return response.data;
};

// Tạo việc làm mới
const createJob = async (jobData, token) => {
  const response = await axios.post('/jobs', jobData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

## Lưu ý

1. **Security**: Trong môi trường production, cần:
   - Sử dụng HTTPS
   - Set JWT_SECRET environment variable
   - Implement rate limiting
   - Validate input data kỹ hơn

2. **Database**: Hiện tại sử dụng mock data, trong thực tế cần:
   - Kết nối database (PostgreSQL, MySQL, MongoDB)
   - Implement proper data validation
   - Add database indexes cho performance

3. **File Upload**: Cần implement API để upload:
   - Avatar images
   - Portfolio files
   - Company logos

4. **Real-time**: Có thể thêm WebSocket cho:
   - Chat giữa employer và freelancer
   - Notifications
   - Real-time job updates 