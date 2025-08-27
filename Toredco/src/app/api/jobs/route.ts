import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '../../../lib/api';

export const dynamic = 'force-dynamic';
// Cache the job listings for 5 minutes to reduce database load
export const revalidate = 300; // 5 minutes

// In-memory cache with 5-minute TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = (searchParams.get('q') || '').trim(); // Changed from 'search' to 'q'
    const type = (searchParams.get('type') || '').trim();
    const location = (searchParams.get('location') || '').trim();
    
    console.log('Search params:', { search, type, location }); // Add debug log
    
    // Create a cache key based on the request parameters
    const cacheKey = JSON.stringify({ search, type, location });
    
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_TTL) {
      return NextResponse.json({
        ...cachedData.data,
        cached: true,
        executionTime: Date.now() - startTime
      });
    }

    // Remove pagination for initial load
    const limit = 100; // Increased limit for initial load

    // Build query parameters for the API
    let queryParams = new URLSearchParams();
    
    // First, fetch all active jobs
    const response = await apiClient.jobs.getAll({
      status: 'active',
      _sort: 'createdAt',
      _order: 'desc'
    });
    
    // Log the raw response for debugging
    console.log('Raw API response type:', typeof response);
    
    // Ensure jobs is always an array
    let jobs: any[] = [];
    
    try {
      // Type assertion to handle Axios response
      const axiosResponse = response as any;
      
      // Log basic response info
      console.log('Response status:', axiosResponse?.status);
      
      // Get the response data
      const responseData = axiosResponse?.data || axiosResponse;
      
      // Log the structure of the response data
      console.log('Response data type:', typeof responseData);
      
      // Handle different response formats
      if (Array.isArray(responseData)) {
        // Case 1: Response is directly an array of jobs
        jobs = responseData;
      } else if (responseData && typeof responseData === 'object') {
        // Case 2: Response is an object with data property
        if (Array.isArray(responseData.data)) {
          jobs = responseData.data;
        } 
        // Case 3: Response has a jobs array
        else if (Array.isArray(responseData.jobs)) {
          jobs = responseData.jobs;
        }
        // Case 4: Response has a data.jobs array
        else if (responseData.data && Array.isArray(responseData.data.jobs)) {
          jobs = responseData.data.jobs;
        }
      }
      
      console.log(`Fetched ${jobs.length} active jobs`);
    } catch (error) {
      console.error('Error processing jobs response:', error);
      jobs = [];
    }

    // Apply exact matching filters for job titles only
    if (search) {
      const searchLower = search.toLowerCase().trim();
      console.log(`Searching for jobs with title containing: "${searchLower}"`);
      
      const originalCount = jobs.length;
      
      // First try exact match in title
      jobs = jobs.filter(job => {
        const title = (job.title || '').toLowerCase();
        // Match if the title contains the exact search phrase
        return title.includes(searchLower);
      });
      
      console.log(`Found ${jobs.length} jobs with exact title match`);
      
      // If no exact matches, try word by word matching
      if (jobs.length === 0) {
        console.log('No exact matches, trying word by word matching...');
        const searchTerms = searchLower.split(' ').filter(term => term.trim().length > 0);
        
        if (searchTerms.length > 0) {
          jobs = jobs.filter(job => {
            const title = (job.title || '').toLowerCase();
            // Match if title contains all search terms (AND condition)
            return searchTerms.every(term => title.includes(term));
          });
          
          console.log(`Found ${jobs.length} jobs with all search terms in title`);
        }
      }
    }
    
    if (type && type !== 'all') {
      jobs = jobs.filter(job => job.type?.toLowerCase() === type.toLowerCase());
    }
    
    if (location && location !== 'all') {
      const locationLower = location.toLowerCase();
      jobs = jobs.filter(job => 
        job.location?.toLowerCase().includes(locationLower)
      );
    }
    
    const totalJobs = jobs.length;

    // Format the response to match frontend expectations
    const result = {
      success: true,
      count: jobs.length,
      data: jobs,
      pagination: {
        page: 1,
        limit: 10, // Default limit
        total: totalJobs,
        totalPages: Math.ceil(totalJobs / 10)
      },
      executionTime: Date.now() - startTime
    };
    
    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      title,
      company,
      location,
      type,
      salary,
      description,
      requirements,
      benefits,
      deadline,
      image,
    } = await req.json();

    // Validate required fields
    if (!title || !company || !location || !type || !salary || !description || !deadline) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create a new job using the API client
    const response = await apiClient.jobs.create({
      title,
      company,
      location,
      type,
      salary: salary || null,
      description,
      requirements: requirements || [],
      benefits: benefits || [],
      image: image || null,
      status: 'pending',
    });
    
    const job = response.data;
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}