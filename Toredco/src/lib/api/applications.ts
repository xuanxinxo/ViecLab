import { PaginationParams, PaginatedResponse } from '@/types/job';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface Application {
  _id: string;
  jobId?: string;
  hiringId?: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  cv?: string;
  status: 'pending' | 'approved' | 'rejected';
  job?: {
    _id: string;
    title: string;
    company: string;
    location?: string;
    salary?: string;
    type?: string;
    requirements?: string[];
    postedDate?: string;
    deadline?: string;
  };
  hiring?: {
    _id: string;
    title: string;
    company: string;
    location?: string;
    salary?: string;
    type?: string;
    requirements?: string[];
    postedDate?: string;
    deadline?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export async function getApplications(params?: PaginationParams): Promise<PaginatedResponse<Application>> {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}/api/applications?${queryParams.toString()}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Không thể tải danh sách đơn ứng tuyển');
  }
  
  return response.json();
}

export async function getFeaturedApplications(limit: number = 8): Promise<Application[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const base = `${apiUrl}/api/applications`;
  const urlWithFilters = `${base}?limit=${limit}&sort=-createdAt`;
  
  console.log(`[getFeaturedApplications] Fetching from: ${urlWithFilters}`);
  
  try {
    let response = await fetch(urlWithFilters, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getFeaturedApplications] API error ${response.status}:`, errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    let data = await response.json();
    console.log('[getFeaturedApplications] API response:', data);
    
    // Handle different response formats
    let applications = Array.isArray(data) 
      ? data 
      : Array.isArray(data?.data) 
        ? data.data 
        : [];
    
    // Fallback: if empty (e.g., no status field), retry without any filters
    if (!applications.length) {
      console.log('[getFeaturedApplications] Empty result, retrying without filters...');
      response = await fetch(base);
      if (response.ok) {
        data = await response.json();
        applications = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      }
    }

    console.log(`[getFeaturedApplications] Found ${applications.length} applications`);
    return applications;
    
  } catch (error) {
    console.error('[getFeaturedApplications] Fetch error:', error);
    // Return empty array instead of throwing to prevent UI crash
    return [];
  }
}

export async function getApplicationById(id: string): Promise<Application> {
  const response = await fetch(`${API_BASE_URL}/api/applications/${id}`, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Không thể tải chi tiết đơn ứng tuyển');
  }
  
  return response.json();
}
