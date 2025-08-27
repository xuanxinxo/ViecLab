"use client";

export const dynamic = "force-dynamic";

import React, { Suspense, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery, UseQueryResult } from '@tanstack/react-query';

// Cache time in milliseconds (5 minutes)
const CACHE_TIME = 5 * 60 * 1000;

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  requirements: string[];
  benefits: string[];
  deadline?: string;
  status: string;
  postedDate: string;
  img: string | null;
}

function ApplyModal({ open, onClose, onSubmit, job }: any) {
  const formRef = useRef<HTMLFormElement>(null);
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-3 right-3 text-gray-500 text-xl hover:text-red-500"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-xl font-semibold text-blue-700 mb-4">
          Ứng tuyển: {job?.title}
        </h3>
        <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
          <input name="name" placeholder="Họ tên" className="border p-2 rounded" required />
          <input name="email" placeholder="Email" className="border p-2 rounded" required type="email" />
          <input name="phone" placeholder="Số điện thoại" className="border p-2 rounded" required />
          <input name="cv" placeholder="Link CV (nếu có)" className="border p-2 rounded" />
          <textarea name="message" placeholder="Tin nhắn" className="border p-2 rounded" rows={4} />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded font-semibold hover:shadow-lg transition-all"
          >
            Gửi ứng tuyển
          </button>
        </form>
      </div>
    </div>
  );
}

interface JobsApiResponse {
  jobs: Job[];
  pagination: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

// Custom hook for fetching jobs with React Query
function useJobsQuery(page: number, limit: number) {
  return useQuery({
    queryKey: ['jobs', 'external', page, limit],
    queryFn: async (): Promise<JobsApiResponse> => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        const res = await fetch(`${backendUrl}/api/jobs?page=${page}&limit=${limit}`);
        
        if (!res.ok) {
          throw new Error('Không thể tải danh sách công việc');
        }
        
        const data = await res.json();
        
        // Transform the response to match the expected format
        return {
          jobs: Array.isArray(data) ? data : (data.data || []),
          pagination: data.pagination || {
            total: Array.isArray(data) ? data.length : (data.data?.length || 0),
            totalPages: 1,
            page,
            limit,
          }
        };
      } catch (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }
    },
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME,
    placeholderData: (previousData) => previousData,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

// Skeleton loader component
function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 animate-pulse">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function AllJobsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [pagination, setPagination] = useState<PaginationState>({
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: 9,
    total: 0,
    totalPages: 1,
  });

  const [applyModal, setApplyModal] = useState<{ open: boolean; job: any }>({
    open: false,
    job: null,
  });

  // Use React Query for data fetching with caching
  const { data, isLoading, isError, error, isFetching } = useJobsQuery(pagination.page, pagination.limit);
  
  // Safely access data with fallbacks
  const jobs = data?.jobs ?? [];
  const paginationData = {
    total: data?.pagination?.total ?? 0,
    totalPages: data?.pagination?.totalPages ?? (Math.ceil((data?.pagination?.total ?? 0) / pagination.limit) || 1),
    page: data?.pagination?.page ?? pagination.page,
    limit: data?.pagination?.limit ?? pagination.limit
  };
  
  // Update URL when pagination changes
  const updateURL = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > paginationData.totalPages) return;
    
    setPagination(prev => ({
      ...prev,
      page: newPage,
    }));
    updateURL(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateURL, paginationData.totalPages]);

  // Update pagination when data is loaded
  useEffect(() => {
    if (data?.pagination) {
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    }
  }, [data?.pagination]);
  
  // Handle error state
  if (isError) {
    return (
      <div className="max-w-6xl mx-auto py-10">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Đã xảy ra lỗi</h1>
        <p className="text-gray-700 mb-4">Không thể tải danh sách công việc. Vui lòng thử lại sau.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Tải lại
        </button>
      </div>
    );
  }

  // Memoize job cards to prevent unnecessary re-renders
  const jobCards = useMemo(() => 
    data?.jobs.map((job: Job) => (
      <div key={job.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-600 mb-1">{job.title}</h3>
              <p className="text-sm text-gray-700 mb-1">Công ty: {job.company}</p>
              <p className="text-sm text-gray-600">Địa điểm: {job.location}</p>
              <p className="text-sm text-gray-600">Loại hình: {job.type}</p>
              <p className="text-sm text-gray-600">Lương: {job.salary || "Thỏa thuận"}</p>
              <p className="text-sm text-gray-400">
                Đăng ngày: {new Date(job.postedDate).toLocaleDateString("vi-VN")}
              </p>
              <p className="mt-2 text-sm text-gray-600 line-clamp-3">{job.description}</p>
            </div>
          </div>
          <button
            onClick={() => setApplyModal({ open: true, job })}
            className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm px-4 py-2 rounded hover:scale-105 transition-all font-semibold"
          >
            Ứng tuyển
          </button>
        </div>
      </div>
    )),
    [data?.jobs, setApplyModal]
  );

  // Pagination controls
  const paginationControls = useMemo(() => {
    if (pagination.totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center items-center space-x-1 mt-8">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="px-3 py-1 rounded-md disabled:text-gray-400 disabled:cursor-not-allowed text-blue-600 hover:bg-blue-50"
        >
          &laquo;
        </button>
        <span className="mx-2 text-gray-600">
          Trang {pagination.page} / {pagination.totalPages}
        </span>
        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          className="px-3 py-1 rounded-md disabled:text-gray-400 disabled:cursor-not-allowed text-blue-600 hover:bg-blue-50"
        >
          &raquo;
        </button>
      </div>
    );
  }, [pagination, handlePageChange]);

  const totalPages = data?.pagination?.totalPages || 1;
  const currentPage = Math.min(pagination.page, totalPages || 1);
  
  // Show loading state
  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Đang tải công việc...</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Đã xảy ra lỗi</h1>
          <p className="text-gray-700 mb-6">Không thể tải danh sách công việc. Vui lòng thử lại sau.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const handleApply = (job: Job) => {
    setApplyModal({ open: true, job });
  };

  const handleApplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      name: (form.name as any).value,
      email: (form.email as any).value,
      phone: (form.phone as any).value,
      cv: (form.cv as any).value,
      message: (form.message as any).value,
      jobId: applyModal.job.id,
    };
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      alert("Ứng tuyển thành công!");
      setApplyModal({ open: false, job: null });
    } else {
      alert("Ứng tuyển thất bại!");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6 text-left">Tất cả việc làm</h1>
        <div className="text-gray-500">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-all"
        >
          ← Quay lại
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
          Danh sách việc làm nổi bật
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md p-5 flex flex-col justify-between"
          >
            <div className="flex gap-4 items-start">
              {/* Bên trái: Thông tin công việc */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-600 mb-1">{job.title}</h3>
                <p className="text-sm text-gray-700 mb-1">Công ty: {job.company}</p>
                <p className="text-sm text-gray-600">Địa điểm: {job.location}</p>
                <p className="text-sm text-gray-600">Loại hình: {job.type}</p>
                <p className="text-sm text-gray-600">Lương: {job.salary || "Thỏa thuận"}</p>
                <p className="text-sm text-gray-400">
                  Đăng ngày: {new Date(job.postedDate).toLocaleDateString("vi-VN")}
                </p>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{job.description}</p>
              </div>

              {/* Bên phải: Hình ảnh */}
              {job.img && (
                <div className="w-24 h-24 bg-white rounded-md shadow-sm overflow-hidden">
                  <img
                    src={job.img}
                    alt={`${job.company} logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
            <button
              onClick={() => handleApply(job)}
              className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm px-4 py-2 rounded hover:scale-105 transition-all font-semibold"
            >
              Ứng tuyển
            </button>
          </div>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            disabled={pagination.page <= 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => router.push(`/jobs?page=${pagination.page - 1}`)}
          >
            {"<"} Trước
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`px-3 py-1 rounded ${p === pagination.page ? "bg-blue-600 text-white" : "bg-gray-100"}`}
              onClick={() => router.push(`/jobs?page=${p}`)}
            >
              {p}
            </button>
          ))}

          <button
            disabled={pagination.page >= pagination.totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => router.push(`/jobs?page=${pagination.page + 1}`)}
          >
            Tiếp {">"}
          </button>
        </div>
      )}

      {/* Application Modal */}
      {applyModal.open && applyModal.job && (
        <ApplyModal
          open={applyModal.open}
          onClose={() => setApplyModal({ open: false, job: null })}
          onSubmit={handleApplySubmit}
          job={applyModal.job}
        />
      )}
    </div>
  );
}

// 👇 Đây là component chính được export (bọc <Suspense>)
export default function JobsPageWrapper() {
  return (
    <Suspense fallback={<div>Đang tải việc làm...</div>}>
      <AllJobsPageContent />
    </Suspense>
  );
}
