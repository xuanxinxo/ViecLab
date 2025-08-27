"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef, Suspense } from "react";

interface Job {
  id: string;
  title: string;
  company: string;
  status: string;
  type?: string;
  postedDate?: string;
  [key: string]: any;
}

const DEFAULT_IMAGE = "/reparo-logo.png"; // không cần /public

function JobCard({ job, type, onApprove, onReject, onApply }: any) {
  return (
    <div className="bg-white rounded shadow p-4 flex flex-col items-center">
      <img
        src={job.image || DEFAULT_IMAGE}
        alt={job.title}
        className="w-20 h-20 object-cover rounded mb-2 border"
        onError={(e) => (e.currentTarget.src = DEFAULT_IMAGE)}
      />
      <div className="font-semibold text-center">{job.title}</div>
      <div className="text-sm text-gray-600 text-center mb-2">
        {job.company}
      </div>
      <div className="flex gap-2 mb-2">
        <button
          className="bg-green-500 text-white px-3 py-1 rounded"
          onClick={() => onApprove(job.id, type)}
        >
          Duyệt
        </button>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded"
          onClick={() => onReject(job.id, type)}
        >
          Từ chối
        </button>
      </div>
      <button
        className="bg-blue-500 text-white px-3 py-1 rounded"
        onClick={() => onApply(job, type)}
      >
        Ứng tuyển
      </button>
    </div>
  );
}

function ApplyModal({ open, onClose, onSubmit, job }: any) {
  const formRef = useRef<HTMLFormElement>(null);
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-lg font-bold mb-4">Ứng tuyển: {job?.title}</h3>
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="flex flex-col gap-3"
        >
          <input
            name="name"
            placeholder="Họ tên"
            className="border p-2 rounded"
            required
          />
          <input
            name="email"
            placeholder="Email"
            className="border p-2 rounded"
            required
            type="email"
          />
          <input
            name="phone"
            placeholder="Số điện thoại"
            className="border p-2 rounded"
            required
          />
          <input
            name="cv"
            placeholder="Link CV (nếu có)"
            className="border p-2 rounded"
          />
          <textarea
            name="message"
            placeholder="Tin nhắn"
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded"
          >
            Gửi ứng tuyển
          </button>
        </form>
      </div>
    </div>
  );
}

async function fetchPendingJobs() {
  const res = await fetch("/api/admin/jobs?status=pending");
  const data = await res.json();
  return data.data || [];
}

async function fetchPendingNewJobs() {
  const res = await fetch("/api/admin/newjobs?status=pending");
  const data = await res.json();
  return data.data || [];
}

async function updateJobStatus(
  id: string,
  type: "job" | "newjob",
  status: "approved" | "rejected"
) {
  const url =
    type === "job" ? `/api/admin/jobs/${id}` : `/api/admin/newjobs/${id}`;
  await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

function ApprovalContent() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [newJobs, setNewJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyModal, setApplyModal] = useState<{
    open: boolean;
    job: any;
    type: string;
  }>({ open: false, job: null, type: "" });
  const [applyLoading, setApplyLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPendingJobs(), fetchPendingNewJobs()]).then(
      ([jobs, newJobs]) => {
        setJobs(jobs);
        setNewJobs(newJobs);
        setLoading(false);
      }
    );
  }, []);

  const handleAction = async (
    id: string,
    type: "job" | "newjob",
    status: "approved" | "rejected"
  ) => {
    await updateJobStatus(id, type, status);
    if (type === "job") setJobs(jobs.filter((j) => j.id !== id));
    else setNewJobs(newJobs.filter((j) => j.id !== id));
  };

  const handleApply = (job: any, type: string) => {
    setApplyModal({ open: true, job, type });
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
      jobId: applyModal.job.id,
    };

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setApplyLoading(false);
    if (res.ok) {
      alert("Ứng tuyển thành công!");
      setApplyModal({ open: false, job: null, type: "" });
    } else {
      alert("Ứng tuyển thất bại!");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Phê duyệt việc chờ duyệt</h1>
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mt-4 mb-2">Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {jobs.length === 0 && <div>Không có job nào chờ duyệt.</div>}
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                type="job"
                onApprove={(id: string) =>
                  handleAction(id, "job", "approved")
                }
                onReject={(id: string) =>
                  handleAction(id, "job", "rejected")
                }
                onApply={handleApply}
              />
            ))}
          </div>

          <h2 className="text-xl font-semibold mt-4 mb-2">New Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newJobs.length === 0 && <div>Không có newjob nào chờ duyệt.</div>}
            {newJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                type="newjob"
                onApprove={(id: string) =>
                  handleAction(id, "newjob", "approved")
                }
                onReject={(id: string) =>
                  handleAction(id, "newjob", "rejected")
                }
                onApply={handleApply}
              />
            ))}
          </div>
        </>
      )}

      <ApplyModal
        open={applyModal.open}
        onClose={() =>
          setApplyModal({ open: false, job: null, type: "" })
        }
        onSubmit={handleApplySubmit}
        job={applyModal.job}
      />
    </div>
  );
}

export default function ApprovalPage() {
  return (
    <Suspense fallback={<div className="p-8">Đang tải dữ liệu...</div>}>
      <ApprovalContent />
    </Suspense>
  );
}
