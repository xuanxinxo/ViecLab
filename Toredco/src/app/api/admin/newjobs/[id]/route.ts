import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
export const dynamic = "force-dynamic";

// PUT /api/admin/newjobs/[id] - Cập nhật việc làm
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getAdminFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    const jobId = params.id;
    const body = await request.json();
    
    // Chỉ update các trường hợp lệ
    const allowedFields = [
      'title', 'company', 'location', 'type', 'salary', 'description',
      'requirements', 'benefits', 'deadline', 'status', 'postedDate', 'isRemote', 'tags'
    ];
    
    const data: any = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        data[key] = body[key];
      }
    }
    
    await prisma.newJob.update({
      where: { id: jobId },
      data,
    });
    
    return NextResponse.json({ success: true, message: 'Job updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/newjobs/[id] - Xóa việc làm (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getAdminFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    const jobId = params.id;
    await prisma.newJob.update({
      where: { id: jobId },
      data: { status: 'deleted' },
    });
    
    return NextResponse.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 

// PATCH /api/admin/newjobs/[id] - Cập nhật nhanh trạng thái hoặc trường lẻ
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getAdminFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const jobId = params.id;
    const body = await request.json();
    const allowedFields = [
      'title', 'company', 'location', 'type', 'salary', 'description',
      'requirements', 'benefits', 'deadline', 'status', 'postedDate', 'isRemote', 'tags'
    ];
    const data: any = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        data[key] = body[key];
      }
    }
    await prisma.newJob.update({
      where: { id: jobId },
      data,
    });
    return NextResponse.json({ success: true, message: 'Job updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
} 