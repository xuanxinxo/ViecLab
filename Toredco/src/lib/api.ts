import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Types
type HttpMethod = 'get' | 'post' | 'put' | 'delete';

// Base API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance with base config
console.log('Initializing API client with base URL:', `${API_URL}/api`);
const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    // Skip auth for login and public routes
    const publicRoutes = ['/auth/login', '/auth/register'];
    const isPublicRoute = config.url && publicRoutes.some(route => config.url?.includes(route));
    
    // Add auth token for protected routes
    if (!isPublicRoute) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization ? 'Bearer [TOKEN]' : 'None'
      }
    });
    
    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} ${response.status}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('[API] Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Handle unauthorized access (401) or forbidden (403)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Only redirect if we're on client-side and not already on the login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
        // Clear any existing auth tokens
        localStorage.removeItem('adminToken');
        // Redirect to login page
        window.location.href = '/admin/login';
      }
      
      // Return a clean error object
      return Promise.reject({
        status: error.response.status,
        message: 'Unauthorized access. Please log in.',
        originalError: error
      });
    }

    // For other errors, check if the response is HTML (like a login page)
    const contentType = error.response?.headers?.['content-type'] || '';
    if (contentType.includes('text/html') && error.response?.data?.startsWith('<!DOCTYPE')) {
      return Promise.reject({
        status: 401,
        message: 'Session expired. Please log in again.',
        originalError: error
      });
    }

    // For other types of errors, return the original error
    return Promise.reject(error);
  }
);

// Generic API client
const createApiClient = <T>(endpoint: string) => ({
  getAll: (params?: any): Promise<AxiosResponse<T[]>> =>
    api.get(`/${endpoint}`, { params }),
  
  getById: (id: string): Promise<AxiosResponse<T>> =>
    api.get(`/${endpoint}/${id}`),
  
  create: (data: Partial<T>): Promise<AxiosResponse<T>> =>
    api.post(`/${endpoint}`, data),
  
  update: (id: string, data: Partial<T>): Promise<AxiosResponse<T>> =>
    api.put(`/${endpoint}/${id}`, data),
  
  delete: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/${endpoint}/${id}`),
  
  // Additional methods can be added here
  customRequest: <R = any>(config: AxiosRequestConfig): Promise<AxiosResponse<R>> =>
    api(config),
});

// API clients for different resources
// Admin API client with admin-specific methods
export const adminApi = {
  // User management
  users: {
    getAll: (params?: any) => api.get('/admin/users', { params }),
    getById: (id: string) => api.get(`/admin/users/${id}`),
    update: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
    delete: (id: string) => api.delete(`/admin/users/${id}`),
  },
  // Add other admin endpoints as needed
};

export const apiClient = {
  users: createApiClient<any>('users'),
  jobs: createApiClient<any>('jobs'),
  newJobs: createApiClient<any>('newjobs'),
  toredco: createApiClient<any>('toredco'),
  applications: createApiClient<any>('applications'),
  admin: adminApi, // Export admin API methods
  hirings: createApiClient<any>('hirings'),
  news: createApiClient<any>('news'),
  
  
  // Custom API methods can be added here
  auth: {
    // Align with backend Express routes under /api/users
    login: (credentials: { email: string; password: string }) =>
      api.post('/users/login', credentials),
    register: (userData: any) =>
      api.post('/users/register', userData),
  },
};

// Legacy exports for backward compatibility (can be removed after updating all components)
export const {
  getAll: fetchJobs,
  getById: fetchJobById,
  create: createJob,
  update: updateJob,
  delete: deleteJob,
} = apiClient.jobs;

export const {
  getAll: fetchHirings,
  getById: fetchHiringById,
  create: createHiring,
  update: updateHiring,
  delete: deleteHiring,
} = apiClient.hirings;

export const {
  getAll: fetchNews,
  getById: fetchNewsById,
  create: createNews,
  update: updateNews,
  delete: deleteNews,
} = apiClient.news;

export const {
  getAll: fetchApplications,
  getById: fetchApplicationById,
  create: createApplication,
  update: updateApplication,
  delete: deleteApplication,
} = apiClient.applications;

export const {
  getAll: fetchUsers,
  create: createUser,
} = apiClient.users;

export const {
  getAll: fetchToredcos,
  getById: fetchToredcoById,
  create: createToredco,
  update: updateToredco,
  delete: deleteToredco,
} = apiClient.toredco;

// ...existing code...

export const {
  getAll: fetchNewJobs,
  getById: fetchNewJobById,
  create: createNewJob,
  update: updateNewJob,
  delete: deleteNewJob,
} = apiClient.newJobs;