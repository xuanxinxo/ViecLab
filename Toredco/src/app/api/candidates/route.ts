import { NextResponse } from 'next/server';
import { apiClient } from '../../../lib/api';

// GET /api/candidates
export async function GET() {
  try {
    // Get all applications
    const applicationsResponse = await apiClient.applications.getAll({ _sort: 'createdAt', _order: 'desc' });
    const candidates = applicationsResponse.data || [];
    
    // Get unique hiring IDs
    const hiringIds = [...new Set(candidates
      .map((c: any) => c.hiringId)
      .filter((id: string | null): id is string => !!id)
    )];
    
    // Fetch related hirings if any
    let hirings: any[] = [];
    if (hiringIds.length > 0) {
      const hiringsResponse = await Promise.all(
        hiringIds.map(id => apiClient.hirings.getById(id))
      );
      hirings = hiringsResponse.map(res => res.data).filter(Boolean);
    }
    
    // Combine data
    const data = candidates.map((candidate: any) => ({
      ...candidate,
      hiring: candidate.hiringId 
        ? hirings.find(h => h.id === candidate.hiringId) || null 
        : null,
    }));
    
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching candidates:', err);
    return NextResponse.json(
      { success: false, message: 'Không thể tải danh sách ứng viên' },
      { status: 500 }
    );
  }
}
