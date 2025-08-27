import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../lib/auth';
import { apiClient } from '../../../../lib/api';

export const dynamic = "force-dynamic";

// GET /api/admin/jobs
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const status = request.nextUrl.searchParams.get('status');
    const queryParams = status && status !== 'all' ? `?status=${status}` : '';
    
    // Use the API client to fetch jobs from the backend
    const response = await apiClient.jobs.getAll(queryParams);
    return NextResponse.json({ success: true, data: response.data });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/jobs
export async function POST(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.title || !body.company || !body.location) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use the API client to create a new job
    const jobData = {
      ...body,
      deadline: new Date(body?.deadline),
      status: 'pending',
      postedDate: new Date().toISOString()
    };

    await apiClient.jobs.create(jobData);
    
    return NextResponse.json(
      { success: true, message: 'Job created successfully' },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error creating job:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
