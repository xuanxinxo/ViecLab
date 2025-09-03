import { NextResponse } from 'next/server';
import { apiClient } from '../../../lib/api';

// GET /api/hirings - lấy danh sách tuyển dụng
export async function GET() {
  try {
    const response = await apiClient.hirings.getAll({
      _sort: 'postedDate',
      _order: 'desc',
    });
    
    // Handle both old and new response formats
    const data = response.data;
    
    // If backend already returns {success: true, data: [...]}, just return it directly
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return NextResponse.json(data);
    }
    
    // Otherwise wrap it
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Lỗi khi lấy danh sách tuyển dụng:', err);
    return NextResponse.json(
      { success: false, message: 'Không thể tải danh sách tuyển dụng' },
      { status: 500 }
    );
  }
}

// POST /api/hirings - thêm tin tuyển dụng (dùng trong admin)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      company,
      location,
      type,
      salary,
      deadline,
      img,
      description = '',
      requirements = [],
      benefits = [],
    } = body;

    // ✅ Kiểm tra các trường bắt buộc
    if (!title || !company || !location || !type || !salary || !deadline) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Parse deadline string into Date, support dd/MM/yyyy
    let deadlineDate: string;
    if (deadline.includes("/")) {
      const parts = deadline.split("/");
      if (parts.length !== 3) {
        return NextResponse.json({ success: false, message: 'Định dạng hạn nộp không hợp lệ' }, { status: 400 });
      }
      const [day, month, year] = deadline.split("/").map(Number);
      deadlineDate = new Date(year, month - 1, day).toISOString();
    } else {
      // Nếu là ISO string hoặc định dạng khác
      deadlineDate = new Date(deadline).toISOString();
    }

    // Kiểm tra ngày hết hạn hợp lệ
    if (isNaN(new Date(deadlineDate).getTime())) {
      return NextResponse.json(
        { success: false, message: 'Ngày hết hạn không hợp lệ' },
        { status: 400 }
      );
    }

    // Tạo mới tin tuyển dụng
    const hiringData = {
      title,
      company,
      location,
      type,
      salary,
      deadline: deadlineDate,
      img: img || '',
      description,
      requirements,
      benefits,
      postedDate: new Date().toISOString(),
    };

    const response = await apiClient.hirings.create(hiringData);

    // Handle both old and new response formats
    const data = response.data;
    
    // If backend already returns {success: true, data: [...]}, just return it directly
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return NextResponse.json(data);
    }
    
    // Otherwise wrap it
    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (err: any) {
    console.error('Lỗi khi thêm tin tuyển dụng:', err);
    
    // Handle specific error messages from backend
    const errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi thêm tin tuyển dụng';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: err.response?.status || 500 }
    );
  }
}
