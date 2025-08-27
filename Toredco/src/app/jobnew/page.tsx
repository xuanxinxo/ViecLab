'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';
interface Job {
  _id: string;
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
  image?: string;
}

function ApplyModal({ open, onClose, onSubmit, job }: any) {
  const formRef = useRef<HTMLFormElement>(null);
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 text-xl hover:text-red-500"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-xl font-semibold text-blue-700 mb-4">Ứng tuyển: {job?.title}</h3>
        <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
          <input name="name" placeholder="Họ tên" className="border p-2 rounded" required />
          <input name="email" placeholder="Email" className="border p-2 rounded" required type="email" />
          <input name="phone" placeholder="Số điện thoại" className="border p-2 rounded" required />
          <input name="cv" placeholder="Link CV (nếu có)" className="border p-2 rounded" />
          <textarea name="message" placeholder="Tin nhắn" className="border p-2 rounded" rows={4} />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded font-semibold hover:shadow-md transition"
          >
            Gửi ứng tuyển
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AllJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [applyModal, setApplyModal] = useState<{ open: boolean; job: any }>({ open: false, job: null });
  const [applyLoading, setApplyLoading] = useState(false);

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        const res = await fetch('/api/newjobs');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setJobs(data.jobs || []);
        setPagination(data.pagination || {});
      } catch (err) {
        console.error('Error loading jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const handleApply = (job: any) => {
    setApplyModal({ open: true, job });
  };

  const handleApplySubmit = async (e: any) => {
    e.preventDefault();
    setApplyLoading(true);
    const form = e.target;
    const data = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      cv: form.cv.value,
      message: form.message.value,
      jobId: applyModal.job._id,
      hiringId: undefined,
    };
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setApplyLoading(false);
    if (res.ok) {
      alert('Ứng tuyển thành công!');
      setApplyModal({ open: false, job: null });
    } else {
      alert('Ứng tuyển thất bại!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold mb-6">Tất cả việc làm</h1>
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Nút quay lại + tiêu đề */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-all"
        >
          ← Quay lại
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
          Danh sách việc làm mới nhất nè
        </h1>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Hiển thị {jobs.length} trong tổng số {pagination.total || jobs.length} việc làm
      </p>

      {/* Danh sách việc làm */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="p-5 border border-gray-200 bg-white rounded-xl shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold text-blue-600 mb-1">{job.title}</h3>
            <p className="text-sm text-gray-700 mb-1">Công ty: {job.company}</p>
            <p className="text-sm text-gray-600">Địa điểm: {job.location}</p>
            <p className="text-sm text-gray-600">Loại: {job.type}</p>
            <p className="text-sm text-gray-600">Lương: {job.salary || 'Thỏa thuận'}</p>
            <p className="text-sm text-gray-400">
              Đăng ngày: {new Date(job.postedDate).toLocaleDateString('vi-VN')}
            </p>
            <p className="mt-2 text-sm text-gray-600 line-clamp-3">{job.description}</p>
            <button
              onClick={() => handleApply(job)}
              className="mt-4 bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
            >
              Ứng tuyển
            </button>
          </div>
        ))}
      </div>

      {/* Trang hiện tại */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          Trang {pagination.page} / {pagination.totalPages}
        </div>
      )}

      <ApplyModal
        open={applyModal.open}
        onClose={() => setApplyModal({ open: false, job: null })}
        onSubmit={handleApplySubmit}
        job={applyModal.job}
      />
    </div>
  );
}
