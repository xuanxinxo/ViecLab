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

    // Tạo sample data cho testing
    const sampleJobs = [
      {
        id: 'sample-1',
        title: 'Frontend Developer React',
        company: 'TechCorp Vietnam',
        location: 'Hồ Chí Minh',
        type: 'Full-time',
        salary: '25.000.000 - 35.000.000 VND',
        description: 'Chúng tôi đang tìm kiếm một Frontend Developer có kinh nghiệm với React để tham gia vào dự án phát triển ứng dụng web.',
        requirements: ['Kinh nghiệm 2+ năm với React', 'Thành thạo JavaScript/TypeScript', 'Hiểu biết về CSS/SCSS'],
        benefits: ['Lương thưởng hấp dẫn', 'Bảo hiểm y tế', 'Môi trường làm việc trẻ trung'],
        tags: ['React', 'JavaScript', 'TypeScript'],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        postedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isRemote: false,
        img: '/img/tech.jpg'
      },
      {
        id: 'sample-2',
        title: 'Backend Developer Node.js',
        company: 'StartupHub',
        location: 'Hà Nội',
        type: 'Full-time',
        salary: '20.000.000 - 30.000.000 VND',
        description: 'Tham gia phát triển backend cho ứng dụng fintech với Node.js và MongoDB.',
        requirements: ['Kinh nghiệm Node.js/Express', 'Hiểu biết về MongoDB', 'Kiến thức về RESTful API'],
        benefits: ['Stock options', 'Flexible working hours', 'Remote work'],
        tags: ['Node.js', 'MongoDB', 'Express'],
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'approved',
        postedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isRemote: true,
        img: '/img/startup.jpg'
      },
      {
        id: 'sample-3',
        title: 'UI/UX Designer',
        company: 'Creative Studio',
        location: 'Đà Nẵng',
        type: 'Part-time',
        salary: '15.000.000 - 20.000.000 VND',
        description: 'Thiết kế giao diện người dùng cho các ứng dụng mobile và web.',
        requirements: ['Kinh nghiệm Figma/Sketch', 'Portfolio đẹp', 'Hiểu biết về UX'],
        benefits: ['Làm việc linh hoạt', 'Môi trường sáng tạo', 'Đào tạo liên tục'],
        tags: ['UI/UX', 'Figma', 'Mobile Design'],
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        postedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isRemote: false,
        img: '/img/design.jpg'
      },
      {
        id: 'sample-4',
        title: 'Mobile Developer Flutter',
        company: 'AppStudio',
        location: 'Hồ Chí Minh',
        type: 'Contract',
        salary: '30.000.000 - 40.000.000 VND',
        description: 'Phát triển ứng dụng mobile cross-platform với Flutter cho startup fintech.',
        requirements: ['Kinh nghiệm Flutter/Dart', 'Hiểu biết về state management', 'Kinh nghiệm với Firebase'],
        benefits: ['Lương cao', 'Tham gia dự án thú vị', 'Cơ hội thăng tiến'],
        tags: ['Flutter', 'Dart', 'Mobile', 'Firebase'],
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'rejected',
        postedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isRemote: true,
        img: '/img/mobile.jpg'
      }
    ];

    // Lọc theo status nếu có
    let filteredJobs = sampleJobs;
    if (status && status !== 'all') {
      filteredJobs = sampleJobs.filter(job => job.status === status);
      console.log(`Filtered to ${filteredJobs.length} jobs with status: ${status}`);
    }

    console.log(`Returning ${filteredJobs.length} jobs`);

    return NextResponse.json({ 
      success: true, 
      data: filteredJobs,
      timestamp: new Date().toISOString(),
      params: { status: status || 'all' }
    });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách công việc:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Đã xảy ra lỗi khi tải danh sách công việc' 
      },
      { status: 500 }
    );
  }
}
