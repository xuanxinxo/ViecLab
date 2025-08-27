'use client';

import { NewJobForm } from '@/components/admin/NewJobForm';

export default function CreateNewJobPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Đăng tin tuyển dụng mới</h1>
        <p className="mt-1 text-sm text-gray-500">Điền đầy đủ thông tin bên dưới để đăng tin tuyển dụng mới</p>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <NewJobForm />
        </div>
      </div>
    </div>
  );
}
