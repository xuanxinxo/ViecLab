# Cấu trúc API - Dự án Toredco

## Tổng quan
Tài liệu này mô tả cấu trúc và cách sử dụng các API trong dự án Toredco. Các API được tổ chức theo từng nhóm chức năng và sử dụng chuẩn RESTful.

## Danh sách API

### 1. Quản lý công việc (Jobs)
- **GET /api/jobs**: Lấy danh sách công việc (có phân trang, tìm kiếm)
- **GET /api/jobs/:id**: Lấy chi tiết một công việc
- **POST /api/jobs**: Tạo mới công việc (yêu cầu quyền admin)
- **PUT /api/jobs/:id**: Cập nhật thông tin công việc (yêu cầu quyền admin)
- **DELETE /api/jobs/:id**: Xóa công việc (yêu cầu quyền admin)

### 2. Công việc mới (New Jobs)
- **GET /api/newjobs**: Lấy danh sách công việc mới nhất
  - Query params:
    - `page`: Số trang (mặc định: 1)
    - `limit`: Số lượng mỗi trang (mặc định: 12)
    - `search`: Từ khóa tìm kiếm

### 3. Tuyển dụng (Hirings)
- **GET /api/hirings**: Lấy danh sách việc làm đã được duyệt
  - Query params:
    - `status`: Trạng thái việc làm (mặc định: 'approved')
    - `page`: Số trang
    - `limit`: Số lượng mỗi trang
    - `search`: Từ khóa tìm kiếm

## Cấu trúc thư mục

```
src/app/api/
├── admin/              # API quản trị
│   ├── jobs/           # Quản lý công việc (admin)
│   ├── applications/   # Quản lý đơn ứng tuyển
│   └── users/          # Quản lý người dùng
├── jobs/              # API công việc (public)
├── newjobs/           # API công việc mới
├── hirings/           # API tuyển dụng
├── applications/      # API ứng tuyển
└── auth/              # Xác thực người dùng
```

## Service Layer (Frontend)

Các API được gọi thông qua service layer để dễ dàng quản lý và tái sử dụng:

```typescript
// src/lib/api/jobs.ts
import { Job, PaginationParams, PaginatedResponse } from '@/types/job';

export async function getJobs(params: PaginationParams): Promise<PaginatedResponse<Job>> {
  // Implementation...
}

export async function getNewJobs(params: PaginationParams): Promise<PaginatedResponse<Job>> {
  // Implementation...
}

export async function getHiringJobs(params: PaginationParams): Promise<PaginatedResponse<Job>> {
  // Implementation...
}

export async function getJobDetail(id: string): Promise<Job> {
  // Implementation...
}
```

## Các thay đổi gần đây

1. **Đã xóa các API không sử dụng:**
   - /api/jobs/optimized
   - /api/jobs/fast
   - /api/freelancers
   - /api/test-hirings

2. **Cập nhật cấu trúc API:**
   - Tổ chức lại thư mục API theo từng nhóm chức năng
   - Thêm service layer cho frontend
   - Cập nhật kiểu dữ liệu TypeScript

## Hướng dẫn sử dụng

1. **Gọi API từ React component:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { getNewJobs } from '@/lib/api/jobs';

function JobList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => getNewJobs({ page: 1, limit: 10 })
  });
  
  // Render UI...
}
```

2. **Thêm mới API:**
   - Tạo file route mới trong thư mục `src/app/api` tương ứng
   - Thêm function mới vào service layer nếu cần
   - Cập nhật kiểu dữ liệu trong `src/types`

## Lưu ý

- Tất cả các API đều trả về dữ liệu dạng JSON
- Sử dụng HTTP status code phù hợp với từng trường hợp
- API yêu cầu xác thực sẽ trả về 401 nếu chưa đăng nhập
- API yêu cầu quyền admin sẽ trả về 403 nếu không có quyền truy cập
