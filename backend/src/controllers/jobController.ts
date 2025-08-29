import { Request, Response } from "express";
import prisma from '../lib/prisma.js';

// Lấy tất cả jobs
export const getJobs = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { status, type, location, isRemote } = req.query;
    
    const where: any = {};
    
    if (status) where.status = status;
    if (type) where.type = type;
    if (location) where.location = { contains: location as string, mode: 'insensitive' };
    if (isRemote !== undefined) where.isRemote = isRemote === 'true';
    
    const jobs = await prisma.job.findMany({
      where,
      orderBy: {
        postedDate: 'desc',
      },
    });
    
    return res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error('Error getting jobs:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Lỗi server khi lấy danh sách công việc' 
    });
  }
};

// Lấy chi tiết job
export const getJobById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy công việc',
      });
    }

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('Error getting job:', error);
    return res.status(500).json({
      success: false,
      error: 'Lỗi server khi lấy thông tin công việc',
    });
  }
};

// Tạo job mới
export const createJob = async (req: Request, res: Response): Promise<Response> => {
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
      isRemote = false,
      tags = [],
    } = req.body;

    if (!title || !company || !location || !type || !salary || !description) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc',
      });
    }

    const createdJob = await prisma.job.create({
      data: {
        title,
        company,
        location,
        type,
        salary,
        description,
        requirements: requirements || [],
        benefits: benefits || [],
        tags: tags || [],
        isRemote: Boolean(isRemote),
        status: 'active',
        deadline: new Date(deadline),
        postedDate: new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      data: createdJob,
    });
  } catch (error) {
    console.error('Error creating job:', error);
    return res.status(500).json({
      success: false,
      error: 'Lỗi server khi tạo công việc mới',
    });
  }
};

// Xóa job
export const deleteJob = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    await prisma.job.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      data: {},
      message: 'Xóa công việc thành công',
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return res.status(500).json({
      success: false,
      error: 'Lỗi server khi xóa công việc',
    });
  }
};
// ...existing code...

// Cập nhật job
export const updateJob = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
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
      isRemote,
      tags,
      status,
    } = req.body;

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title,
        company,
        location,
        type,
        salary,
        description,
        requirements,
        benefits,
        tags,
        isRemote,
        status,
        deadline: deadline ? new Date(deadline) : undefined,
      },
    });

    return res.status(200).json({
      success: true,
      data: updatedJob,
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return res.status(500).json({
      success: false,
      error: 'Lỗi server khi cập nhật công việc',
    });
  }
};
// ...existing code...