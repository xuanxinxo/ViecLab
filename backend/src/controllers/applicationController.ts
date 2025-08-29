import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';

type AuthenticatedRequest = Request & {
  user?: {
    email: string;
    id: string;
  };
};

// Helper function to get application with relations
async function getApplicationWithRelations(application: any) {
  const [job, hiring] = await Promise.all([
    application.jobId ? prisma.job.findUnique({ where: { id: application.jobId } }) : null,
    application.hiringId ? prisma.hiring.findUnique({ where: { id: application.hiringId } }) : null,
  ]);

  return {
    ...application,
    job: job ? {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
    } : null,
    hiring: hiring ? {
      id: hiring.id,
      title: hiring.title,
      company: hiring.company,
    } : null,
  };
}

const prisma = new PrismaClient();

// Lấy tất cả đơn ứng tuyển (admin only)
export const getApplications = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { status, sort, limit } = req.query as { [key: string]: string | undefined };

    const where: any = {};
    if (status) {
      where.status = status;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort) {
      if (sort === '-createdAt') orderBy = { createdAt: 'desc' };
      else if (sort === 'createdAt') orderBy = { createdAt: 'asc' };
    }

    const take = limit ? Math.max(0, parseInt(limit, 10)) : undefined;

    const applications = await prisma.application.findMany({
      where,
      orderBy,
      take,
    });

    const applicationsWithRelations = await Promise.all(
      applications.map(app => getApplicationWithRelations(app))
    );

    return res.status(200).json({
      success: true,
      count: applicationsWithRelations.length,
      data: applicationsWithRelations,
    });
  } catch (error) {
    console.error('Error getting applications:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get applications'
    });
  }
};

// Lấy đơn ứng tuyển của người dùng hiện tại
export const getMyApplications = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user?.email) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated or invalid user data',
      });
    }

    const applications = await prisma.application.findMany({
      where: { email: req.user.email },
      orderBy: { createdAt: 'desc' },
    });

    const applicationsWithRelations = await Promise.all(
      applications.map(app => getApplicationWithRelations(app))
    );

    return res.status(200).json({
      success: true,
      data: applicationsWithRelations,
    });
  } catch (error) {
    console.error('Error getting my applications:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get your applications',
    });
  }
};

// Tạo đơn ứng tuyển mới
export const createApplication = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, name, phone, message, cv, jobId, hiringId } = req.body;

    if (!email || !name || !phone) {
      return res.status(400).json({ error: 'Email, name, and phone are required' });
    }

    const newApplication = await prisma.application.create({
      data: {
        email,
        name,
        phone,
        message,
        cv,
        jobId,
        hiringId,
        createdAt: new Date(),
      },
    });

    const applicationWithRelations = await getApplicationWithRelations(newApplication);

    return res.status(201).json({
      success: true,
      data: applicationWithRelations,
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to create application' 
    });
  }
};

// Lấy đơn ứng tuyển theo ID
export const getApplicationById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const applicationWithRelations = await getApplicationWithRelations(application);

    return res.status(200).json({
      success: true,
      data: applicationWithRelations,
    });
  } catch (error) {
    console.error('Error getting application:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to get application' 
    });
  }
};

// Cập nhật đơn ứng tuyển
export const updateApplication = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { email, name, phone, message, cv, jobId, hiringId } = req.body;

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        email,
        name,
        phone,
        message,
        cv,
        jobId,
        hiringId,
      },
    });

    const applicationWithRelations = await getApplicationWithRelations(updatedApplication);

    return res.status(200).json({
      success: true,
      data: applicationWithRelations,
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to update application' 
    });
  }
};

// Xóa đơn ứng tuyển
export const deleteApplication = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    await prisma.application.delete({
      where: { id },
    });

    return res.status(200).json({ 
      success: true,
      message: 'Application deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to delete application' 
    });
  }
};