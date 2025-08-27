import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '../../../../lib/api';

export const dynamic = "force-dynamic";

// POST - Tạo job mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      company,
      location,
      salary,
      tags,
      isRemote,
      type,
      description,
      requirements,
      benefits,
      deadline,
      img,
    } = body;

    // Kiểm tra các trường bắt buộc
    if (!title || !company || !location || !type || !description || !deadline || !img) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Chuẩn bị dữ liệu job mới
    const newJobData = {
      title,
      company,
      location,
      salary: salary?.toString() || 'Thỏa thuận',
      tags: tags ?? [],
      isRemote: isRemote ?? false,
      type,
      description,
      requirements: requirements ?? [],
      benefits: benefits ?? [],
      deadline: new Date(deadline).toISOString(),
      status: 'pending', // Mặc định là pending, cần admin duyệt
      postedDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      img,
    };

    // Gọi API để tạo job mới
    const response = await apiClient.jobs.create(newJobData);

    return NextResponse.json(
      { success: true, data: response.data }, 
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Lỗi khi tạo job mới:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || 'Đã xảy ra lỗi khi tạo công việc mới' 
      },
      { status: 500 }
    );
  }
}

// GET - Lấy danh sách job theo status
export async function GET(request: NextRequest) {
  console.log('=== NEWJOBS API ROUTE CALLED ===');
  console.log('Request URL:', request.url);
  
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    console.log('Status filter from URL:', status);

    // Tạo query parameters cho API
    const queryParams: Record<string, any> = {
      _sort: 'createdAt',
      _order: 'desc',
      _limit: 100, // Giới hạn số lượng bản ghi trả về
    };

    // Thêm filter status nếu có
    if (status && status !== 'all') {
      queryParams.status = status;
      console.log('Filtering by status:', status);
    } else {
      // Nếu là 'all' hoặc không có status, lấy tất cả các trạng thái
      queryParams.status = ['pending', 'approved', 'rejected'];
      console.log('No specific status filter, getting all statuses');
    }

    console.log('Final query params:', JSON.stringify(queryParams, null, 2));
    console.log('API Client baseURL:', apiClient.jobs['endpoint']);

    try {
      // Gọi API để lấy danh sách jobs
      console.log('Calling apiClient.jobs.getAll with params:', JSON.stringify(queryParams));
      const response = await apiClient.jobs.getAll(queryParams);
      console.log('API Response status:', response.status);
      console.log('API Response headers:', JSON.stringify(response.headers, null, 2));
      
      // Kiểm tra và xử lý dữ liệu trả về
      const responseData = response.data || {};
      let jobsData = [];
      
      // Handle different possible response formats
      if (Array.isArray(responseData)) {
        console.log('Response data is an array, length:', responseData.length);
        jobsData = responseData;
      } else if (responseData && Array.isArray(responseData.data)) {
        console.log('Response data has a data array, length:', responseData.data.length);
        jobsData = responseData.data;
      } else if (responseData && responseData.news) {
        console.log('Response data has a news array, length:', responseData.news.length);
        jobsData = responseData.news;
      } else {
        console.warn('Unexpected response format:', JSON.stringify(responseData, null, 2));
      }
      
      console.log(`Found ${jobsData.length} jobs`);
      
      // Log mẫu dữ liệu để kiểm tra
      if (jobsData.length > 0) {
        console.log('Sample job data (first 3 items):', 
          JSON.stringify(jobsData.slice(0, 3), null, 2));
      } else {
        console.warn('No jobs found with the current filters');
      }

      return NextResponse.json({ 
        success: true, 
        data: jobsData,
        timestamp: new Date().toISOString(),
        params: queryParams
      });
    } catch (apiError) {
      console.error('Error calling jobs API:', {
        message: apiError.message,
        stack: apiError.stack,
        response: apiError.response?.data
      });
      throw apiError;
    }
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách công việc:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || 'Đã xảy ra lỗi khi tải danh sách công việc' 
      },
      { status: 500 }
    );
  }
}
