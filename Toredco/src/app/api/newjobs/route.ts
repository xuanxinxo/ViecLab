import { NextRequest, NextResponse } from 'next/server';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  postedDate: string;
  salary?: string;
  description: string;
  requirements: string[];
  status: string;
  [key: string]: any;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get query parameters with proper type conversion and defaults
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const searchQuery = (searchParams.get('search') || '').toLowerCase().trim();
    const locationQuery = (searchParams.get('location') || '').toLowerCase().trim();

    console.log('Search parameters:', { searchQuery, locationQuery, page, limit });
    
    // Fetch jobs from the backend with search parameters
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const apiUrl = new URL(`${backendUrl}/api/newjobs`);
    
    // Add search parameters to the backend API call
    if (searchQuery) apiUrl.searchParams.append('search', searchQuery);
    if (locationQuery) apiUrl.searchParams.append('location', locationQuery);
    
    const response = await fetch(apiUrl.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    let jobs: Job[] = await response.json();
    
    // Apply filters
    if (searchQuery || locationQuery) {
      jobs = jobs.filter(job => {
        const matchesSearch = !searchQuery || 
          job.title?.toLowerCase().includes(searchQuery) ||
          job.description?.toLowerCase().includes(searchQuery) ||
          job.company?.toLowerCase().includes(searchQuery);
          
        const matchesLocation = !locationQuery || 
          (job.location && job.location.toLowerCase().includes(locationQuery));
          
        return matchesSearch && matchesLocation;
      });
    }
    
    // Calculate pagination
    const totalJobs = jobs.length;
    const totalPages = Math.ceil(totalJobs / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedJobs = jobs.slice(startIndex, endIndex);

    console.log(`Returning ${paginatedJobs.length} of ${totalJobs} jobs`);
    
    return NextResponse.json({
      data: paginatedJobs,
      pagination: {
        page,
        limit,
        total: totalJobs,
        totalPages,
      },
    });

  } catch (error) {
    console.error('Error fetching newjobs:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    );
  }
}
