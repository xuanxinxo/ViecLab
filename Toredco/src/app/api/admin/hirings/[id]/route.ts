import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '../../../../../lib/auth';
import { apiClient } from '../../../../../lib/api';

export const dynamic = "force-dynamic";

// PUT /api/admin/hirings/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Hiring ID is required' }, { status: 400 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.company || !body.location) {
      return NextResponse.json(
        { success: false, message: 'Title, company, and location are required' },
        { status: 400 }
      );
    }

    // Cập nhật hiring
    const response = await apiClient.hirings.update(id, body);
    
    return NextResponse.json({ 
      success: true, 
      data: response.data,
      message: 'Hiring updated successfully' 
    });
  } catch (err) {
    console.error('Error updating hiring:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/hirings/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Hiring ID is required' }, { status: 400 });
    }

    // Xóa hiring
    await apiClient.hirings.delete(id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Hiring deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting hiring:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

