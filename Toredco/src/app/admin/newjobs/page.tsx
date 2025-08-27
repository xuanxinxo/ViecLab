"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface NewJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  status: string;
  postedDate?: string;
  deadline?: string;
}

export default function AdminNewJobs() {
  const [jobs, setJobs] = useState<NewJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadJobs();
  }, [filter]);

  async function loadJobs() {
    try {
      console.log('=== LOADING JOBS ===');
      console.log('Current filter:', filter);
      setLoading(true);
      setError("");
      
      const apiUrl = `/api/admin/newjobs?status=${filter}`;
      console.log('API URL:', apiUrl);
      
      console.log('Making fetch request to:', apiUrl);
      const startTime = Date.now();
      
      try {
        const res = await fetch(apiUrl, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const responseTime = Date.now() - startTime;
        
        console.log(`Response received in ${responseTime}ms`);
        console.log('Response status:', res.status, res.statusText);
        
        const json = await res.json().catch(e => {
          console.error('Error parsing JSON:', e);
          throw new Error('Invalid JSON response from server');
        });
        
        console.log('API Response:', {
          status: res.status,
          success: json.success,
          dataType: json.data ? typeof json.data : 'undefined',
          isDataArray: Array.isArray(json.data),
          dataLength: Array.isArray(json.data) ? json.data.length : 'N/A',
          timestamp: json.timestamp,
          params: json.params
        });
        
        if (!res.ok) {
          throw new Error(json.message || `HTTP error! status: ${res.status}`);
        }
        
        if (json.success) {
          // Handle both direct array and data property formats
          const jobsData = Array.isArray(json.data) ? json.data : 
                          (json.data && Array.isArray(json.data.data) ? json.data.data : []);
          
          console.log(`Setting ${jobsData.length} jobs to state`);
          if (jobsData.length > 0) {
            console.log('First job sample:', JSON.stringify(jobsData[0], null, 2));
          }
          
          setJobs(jobsData);
        } else {
          console.warn('API returned success:false', json);
          setError(json.message || 'Không thể tải danh sách công việc');
        }
      } catch (error: any) {
        console.error('Error in fetch or processing:', error);
        throw error; // Re-throw to be caught by outer catch
      }
    } catch (error: unknown) {
      console.error('Error loading jobs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
      setError(`Không thể tải danh sách việc làm: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa việc làm này?")) return;
    try {
      const res = await fetch(`/api/admin/newjobs/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setJobs(jobs.filter(j => j.id !== id));
        alert("Đã xóa thành công!");
      } else {
        alert("Xóa thất bại: " + json.message);
      }
    } catch {
      alert("Có lỗi khi xóa việc làm");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-16">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 mr-4">← Quay lại Dashboard</Link>
          <h1 className="text-xl font-bold">Quản lý việc làm TopNew</h1>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <label className="mr-2 font-medium">Lọc theo trạng thái:</label>
            <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded px-2 py-1">
              <option value="all">Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
          <Link href="/admin/jobnew/create" className="bg-blue-600 text-white px-4 py-2 rounded">+ Đăng việc TopNew</Link>
        </div>
        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : jobs.length === 0 ? (
          <div>Không có việc làm nào.</div>
        ) : (
          <table className="w-full bg-white rounded shadow overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Tiêu đề</th>
                <th className="p-2 text-left">Công ty</th>
                <th className="p-2 text-left">Địa điểm</th>
                <th className="p-2 text-left">Loại</th>
                <th className="p-2 text-left">Lương</th>
                <th className="p-2 text-left">Trạng thái</th>
                <th className="p-2 text-left">Hạn nộp</th>
                <th className="p-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} className="border-b">
                  <td className="p-2 font-semibold">{job.title}</td>
                  <td className="p-2">{job.company}</td>
                  <td className="p-2">{job.location}</td>
                  <td className="p-2">{job.type}</td>
                  <td className="p-2">{job.salary || 'Thỏa thuận'}</td>
                  <td className="p-2 capitalize">{job.status}</td>
                  <td className="p-2">{job.deadline ? new Date(job.deadline).toLocaleDateString() : ''}</td>
                  <td className="p-2">
                    <button className="text-red-600 hover:underline mr-2" onClick={() => handleDelete(job.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
} 