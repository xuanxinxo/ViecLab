'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// import { apiClient } from '../../../../../src/lib/api';
import { apiClient } from '../../../lib/api';
interface Job {
  id: string;
  _id?: string; // For MongoDB compatibility
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  status: string;
  postedDate: string;
  deadline: string;
}

export default function AdminJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(10);
  const router = useRouter();

  useEffect(() => {
    // Check authentication in the client-side only
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      loadJobs();
    }
  }, [filter, router]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiClient.jobs.getAll({
        status: filter === 'all' ? '' : filter,
        _sort: 'createdAt',
        _order: 'desc',
        _limit: 100
      });
      
      // Handle different response formats
      let jobsData = [];
      if (Array.isArray(response)) {
        jobsData = response;
      } else if (response && typeof response === 'object' && 'data' in response) {
        jobsData = Array.isArray(response.data) ? response.data : [];
      }
      
      // Format jobs data
      const formattedJobs = jobsData.map((job) => ({
        id: job.id || job._id || '',
        _id: job._id || job.id || '',
        title: job.title || 'No Title',
        company: job.company || 'No Company',
        location: job.location || 'Remote',
        type: job.type || 'Full-time',
        salary: job.salary || 'Negotiable',
        status: job.status || 'pending',
        postedDate: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A',
        deadline: job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'
      }));
      
      setJobs(formattedJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        // Cập nhật trực tiếp danh sách thay vì load lại toàn bộ
        setJobs(prev =>
          prev.map(job => job.id === jobId ? { ...job, status: newStatus } : job)
        );
      } else {
        alert('Có lỗi xảy ra khi cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const handleDelete = async (jobId: string) => {
    if (confirm('Bạn có chắc muốn xóa việc làm này?')) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/admin/jobs/${jobId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setJobs(prev => prev.filter(job => job.id !== jobId));
        } else {
          alert('Có lỗi xảy ra khi xóa việc làm');
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Có lỗi xảy ra khi xóa việc làm');
      }
    }
  };

  const filteredJobs = jobs.filter(job => filter === 'all' || job.status === filter);
  const displayedJobs = filteredJobs.slice(0, visibleCount);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 mt-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-blue-600 hover:text-blue-800">
                ← Quay lại Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý việc làm</h1>
            </div>
            <Link
              href="/admin/jobs/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Đăng việc làm mới
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex space-x-4 overflow-x-auto">
            {[
              { key: 'all', label: 'Tất cả', color: 'bg-blue-600', count: jobs.length },
              { key: 'active', label: 'Đang hoạt động', color: 'bg-green-600', count: jobs.filter(j => j.status === 'active').length },
              { key: 'pending', label: 'Chờ duyệt', color: 'bg-yellow-600', count: jobs.filter(j => j.status === 'pending').length },
              { key: 'expired', label: 'Hết hạn', color: 'bg-red-600', count: jobs.filter(j => j.status === 'expired').length },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  filter === item.key ? `${item.color} text-white` : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {item.label} ({item.count})
              </button>
            ))}
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Việc làm', 'Công ty', 'Địa điểm', 'Loại', 'Lương', 'Trạng thái', 'Ngày đăng', 'Thao tác'].map(head => (
                    <th key={head} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedJobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">Không có việc làm nào</td>
                  </tr>
                ) : (
                  displayedJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap max-w-[200px] truncate">{job.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap max-w-[150px] truncate">{job.company}</td>
                      <td className="px-6 py-4 whitespace-nowrap max-w-[150px] truncate">{job.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{job.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{job.salary}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          job.status === 'active' ? 'bg-green-100 text-green-800' :
                          job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {job.status === 'active' ? 'Đang hoạt động' :
                           job.status === 'pending' ? 'Chờ duyệt' : 'Hết hạn'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(job.postedDate).toLocaleDateString('vi-VN')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/jobs/${job.id}/edit`}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs"
                          >
                            Sửa
                          </Link>
                          {job.status === 'pending' && (
                            <button
                              onClick={() => handleStatusChange(job.id, 'active')}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-xs"
                            >
                              Duyệt
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(job.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Xem thêm */}
        {visibleCount < filteredJobs.length && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Xem thêm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
