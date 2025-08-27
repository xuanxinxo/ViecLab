import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../lib/auth';
import { apiClient } from '../../../../../lib/api';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = "force-dynamic";

// GET /api/admin/jobs/[id] - Get job details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAdminFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use the API client to fetch job details
    const response = await apiClient.jobs.getById(params.id);
    if (!response.data) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/jobs/[id] - Update job
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAdminFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const jobId = params.id;

    // Process form data
    const data: any = {};
    const fields = [
      'title', 'company', 'location', 'type', 'salary', 'description',
      'requirements', 'benefits', 'deadline', 'status'
    ];

    fields.forEach(field => {
      const value = formData.get(field);
      if (value !== null && value !== undefined) {
        if (field === 'requirements' || field === 'benefits') {
          data[field] = formData.getAll(field).map(item => item.toString());
        } else if (field === 'deadline' && value) {
          data[field] = new Date(value.toString());
        } else if (value) {
          data[field] = value.toString();
        }
      }
    });

    // Handle file upload if present
    const imgFile = formData.get('img') as File | null;
    if (imgFile && imgFile instanceof File) {
      const buffer = Buffer.from(await imgFile.arrayBuffer());
      const filename = `${Date.now()}_${imgFile.name}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'jobs');
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      data.img = `/uploads/jobs/${filename}`;
    }

    // Use the API client to update the job
    await apiClient.jobs.update(jobId, data);

    return NextResponse.json({
      success: true,
      message: 'Job updated successfully',
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/jobs/[id] - Delete job (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAdminFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use the API client to mark job as deleted
    await apiClient.jobs.update(params.id, { status: 'deleted' });

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/jobs/[id] - Quick update job fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAdminFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const allowedFields = [
      'title', 'company', 'location', 'type', 'salary', 'description',
      'requirements', 'benefits', 'deadline', 'status', 'postedDate', 'img'
    ];

    // Filter only allowed fields
    const updateData: any = {};
    Object.keys(body).forEach(key => {
      if (allowedFields.includes(key) && body[key] !== undefined) {
        updateData[key] = body[key];
      }
    });

    // Use the API client to update the job
    await apiClient.jobs.update(params.id, updateData);

    return NextResponse.json({
      success: true,
      message: 'Job updated successfully',
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}