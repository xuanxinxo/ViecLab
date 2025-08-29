import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lấy tất cả tin tuyển dụng
export const getHirings = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const hirings = await prisma.hiring.findMany({
      orderBy: {
        postedDate: 'desc'
      }
    });
    return res.status(200).json({ success: true, data: hirings });
  } catch (error) {
    console.error('Error getting hirings:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to get hirings',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Tạo tin tuyển dụng mới
export const createHiring = async (req: Request, res: Response): Promise<Response> => {
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
      postedDate,
      img,
    } = req.body;

    // Validation
    if (!title || !company || !location || !type || !salary || !deadline) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: title, company, location, type, salary, deadline' 
      });
    }

    // Validate deadline
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid deadline format' 
      });
    }

    const hiring = await prisma.hiring.create({
      data: {
        title,
        company,
        location,
        type,
        salary,
        description: description || '',
        requirements: requirements || [],
        benefits: benefits || [],
        deadline: deadlineDate,
        postedDate: postedDate ? new Date(postedDate) : new Date(),
        img: img || '',
      },
    });

    return res.status(201).json({ success: true, data: hiring });
  } catch (error) {
    console.error('Error creating hiring:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create hiring',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Lấy chi tiết tin tuyển dụng
export const getHiringById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Hiring ID is required' 
      });
    }

    const hiring = await prisma.hiring.findUnique({
      where: { id },
    });

    if (!hiring) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hiring not found' 
      });
    }

    return res.status(200).json({ success: true, data: hiring });
  } catch (error) {
    console.error('Error getting hiring:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to get hiring',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Cập nhật tin tuyển dụng
export const updateHiring = async (req: Request, res: Response): Promise<Response> => {
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
      img,
    } = req.body;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Hiring ID is required' 
      });
    }

    // Check if hiring exists
    const existingHiring = await prisma.hiring.findUnique({
      where: { id },
    });

    if (!existingHiring) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hiring not found' 
      });
    }

    const updatedHiring = await prisma.hiring.update({
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
        deadline: deadline ? new Date(deadline) : undefined,
        img,
      },
    });

    return res.status(200).json({ success: true, data: updatedHiring });
  } catch (error) {
    console.error('Error updating hiring:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update hiring',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Xóa tin tuyển dụng
export const deleteHiring = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Hiring ID is required' 
      });
    }

    // Check if hiring exists
    const existingHiring = await prisma.hiring.findUnique({
      where: { id },
    });

    if (!existingHiring) {
      return res.status(404).json({ 
        success: false, 
        message: 'Hiring not found' 
      });
    }

    await prisma.hiring.delete({
      where: { id },
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Hiring deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting hiring:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete hiring',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
