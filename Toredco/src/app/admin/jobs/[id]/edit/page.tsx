'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface JobFormData {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  deadline: string;
  img?: string;
}

export default function EditJob() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: [''],
    benefits: [''],
    deadline: '',
    img: '',
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetch(`/api/admin/jobs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const j = data.data;
          const deadlineValue = j?.deadline
            ? new Date(j.deadline).toISOString().slice(0, 10)
            : '';

          setFormData({
            title: j.title || '',
            company: j.company || '',
            location: j.location || '',
            type: j.type || 'Full-time',
            salary: j.salary || '',
            description: j.description || '',
            requirements: Array.isArray(j.requirements) && j.requirements.length ? j.requirements : [''],
            benefits: Array.isArray(j.benefits) && j.benefits.length ? j.benefits : [''],
            deadline: deadlineValue,
            img: j.img || '',
          });
        } else {
          setError(data.message || 'Failed to load job');
        }
      })
      .catch(() => setError('Failed to load job'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field: 'requirements' | 'benefits', idx: number, val: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === idx ? val : item)),
    }));
  };

  const addArrayItem = (field: 'requirements' | 'benefits') => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field: 'requirements' | 'benefits', idx: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== idx),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const form = new FormData();

      form.append('title', formData.title);
      form.append('company', formData.company);
      form.append('location', formData.location);
      form.append('type', formData.type);
      form.append('salary', formData.salary);
      form.append('description', formData.description);
      form.append('deadline', formData.deadline);

      formData.requirements
        .filter((r) => r.trim())
        .forEach((req) => form.append('requirements', req));

      // Đánh dấu là client đã gửi trường requirements để server có thể cập nhật mảng rỗng
      form.append('requirementsPresent', '1');

      formData.benefits
        .filter((b) => b.trim())
        .forEach((ben) => form.append('benefits', ben));

      // Đánh dấu là client đã gửi trường benefits để server có thể cập nhật mảng rỗng
      form.append('benefitsPresent', '1');

      if (selectedImage) {
        form.append('img', selectedImage);
      }

      const res = await fetch(`/api/admin/jobs/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        router.push('/admin/jobs');
      } else {
        setError(data.message || 'Update failed');
      }
    } catch (err) {
      setError('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Sửa việc làm</h1>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Tiêu đề"
              className="w-full px-3 py-2 border rounded"
            />
            <input
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              required
              placeholder="Công ty"
              className="w-full px-3 py-2 border rounded"
            />
            <input
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              placeholder="Địa điểm"
              className="w-full px-3 py-2 border rounded"
            />
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
            </select>
            <input
              name="salary"
              value={formData.salary}
              onChange={handleInputChange}
              placeholder="Lương"
              className="w-full px-3 py-2 border rounded"
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Mô tả"
              className="w-full px-3 py-2 border rounded"
            />

            {/* Image preview and upload */}
            <div>
              <label className="font-medium">Hình ảnh</label>
              {selectedImage ? (
                <div className="mb-2">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected Preview"
                    className="w-40 h-auto rounded"
                  />
                </div>
              ) : formData.img ? (
                <div className="mb-2">
                  <img
                    src={formData.img}
                    alt="Current Image"
                    className="w-40 h-auto rounded"
                  />
                </div>
              ) : null}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="font-medium">Yêu cầu</label>
              {formData.requirements.map((req, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <input
                    value={req}
                    onChange={(e) => handleArrayChange('requirements', idx, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded"
                  />
                  {formData.requirements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('requirements', idx)}
                      className="ml-2 text-red-600"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('requirements')}
                className="text-blue-600"
              >
                + Thêm yêu cầu
              </button>
            </div>

            {/* Benefits */}
            <div>
              <label className="font-medium">Quyền lợi</label>
              {formData.benefits.map((ben, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <input
                    value={ben}
                    onChange={(e) => handleArrayChange('benefits', idx, e.target.value)}
                    className="flex-1 px-3 py-2 border rounded"
                  />
                  {formData.benefits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('benefits', idx)}
                      className="ml-2 text-red-600"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('benefits')}
                className="text-blue-600"
              >
                + Thêm quyền lợi
              </button>
            </div>

            {/* Deadline */}
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/jobs')}
              className="px-4 py-2 border rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {saving ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
