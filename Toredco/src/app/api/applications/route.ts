import { NextResponse } from "next/server";
// import { apiClient } from "@/lib/api";
import { apiClient } from '../../../lib/api';
import { getUserFromRequest } from "@/src/lib/auth";

export async function POST(req: Request) {
  console.log('[APPLICATIONS] POST request received');
  
  // Kiểm tra đăng nhập
  const user = getUserFromRequest(req);
  if (!user) {
    console.log('[APPLICATIONS] Unauthorized access attempt');
    return NextResponse.json({ 
      success: false, 
      message: 'Bạn cần đăng nhập để ứng tuyển' 
    }, { status: 401 });
  }
  
  try {
    const requestData = await req.json();
    console.log('[APPLICATIONS] Request data:', requestData);
    
    const { jobId, hiringId, name, email, phone, message, cv } = requestData;
    
    if (!jobId && !hiringId) {
      console.error('[APPLICATIONS] Missing jobId and hiringId');
      return NextResponse.json({ 
        success: false, 
        message: 'Thiếu jobId hoặc hiringId' 
      }, { status: 400 });
    }
    
    // Validate required fields
    if (!name || !email) {
      console.error('[APPLICATIONS] Missing required fields');
      return NextResponse.json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      }, { status: 400 });
    }
    
    // Create application using the API client
    const response = await apiClient.applications.create({
      jobId: jobId || undefined,
      hiringId: hiringId || undefined,
      name,
      email,
      phone: phone || '',
      message: message || '',
      cv: cv || ''
    });
    
    console.log('[APPLICATIONS] Application created successfully:', response.data);
    return NextResponse.json({ 
      success: true, 
      data: response.data 
    });
    
  } catch (err) {
    console.error('[APPLICATIONS] Error creating application:', err);
    return NextResponse.json({ 
      success: false, 
      message: 'Lỗi server khi tạo đơn ứng tuyển',
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  console.log('[APPLICATIONS] GET request received');
  
  try {
    // Fetch applications using the API client
    const response = await apiClient.applications.getAll();
    const applications = response.data || [];
    
    console.log(`[APPLICATIONS] Fetched ${applications.length} applications`);
    
    // Fetch job and hiring data for each application
    const applicationsWithJobData = await Promise.all(
      applications.map(async (app: any) => {
        try {
          let jobDetails = null;
          
          if (app.jobId) {
            console.log(`[APPLICATIONS] Fetching job details for jobId: ${app.jobId}`);
            try {
              const jobRes = await apiClient.jobs.getById(app.jobId);
              jobDetails = jobRes.data;
            } catch (jobErr) {
              console.error(`[APPLICATIONS] Error fetching job ${app.jobId}:`, jobErr);
              // Try to get from newJobs if not found in jobs
              try {
                const newJobRes = await apiClient.newJobs.getById(app.jobId);
                jobDetails = newJobRes.data;
              } catch (newJobErr) {
                console.error(`[APPLICATIONS] Error fetching newJob ${app.jobId}:`, newJobErr);
              }
            }
          } else if (app.hiringId) {
            console.log(`[APPLICATIONS] Fetching hiring details for hiringId: ${app.hiringId}`);
            try {
              const hiringRes = await apiClient.hirings.getById(app.hiringId);
              jobDetails = hiringRes.data;
            } catch (hiringErr) {
              console.error(`[APPLICATIONS] Error fetching hiring ${app.hiringId}:`, hiringErr);
            }
          }
          
          return {
            ...app,
            job: jobDetails || null,
            hiring: jobDetails || null,
            newJob: jobDetails || null
          };
        } catch (err) {
          console.error(`[APPLICATIONS] Error processing application ${app.id || 'unknown'}:`, err);
          return app; // Return the application as-is if we can't get job details
        }
      })
    );

    return NextResponse.json(applicationsWithJobData);
  } catch (err) {
    console.error('[APPLICATIONS] Error in GET handler:', err);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi khi tải danh sách đơn ứng tuyển',
        error: err instanceof Error ? err.message : 'Lỗi không xác định'
      }, 
      { status: 500 }
    );
  }
} 