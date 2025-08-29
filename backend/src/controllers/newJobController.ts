import { Request, Response } from "express";
// import { PrismaClient } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Lấy tất cả NewJob
export const getAllNewJobs = async (_req: Request, res: Response) => {
  try {
    console.log('Fetching all new jobs...');
    const jobs = await prisma.newJob.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log(`Found ${jobs.length} jobs`);
    
    if (jobs.length === 0) {
      console.log('No jobs found in the database');
      // Check if the collection exists
      const collections = await prisma.$runCommandRaw({ listCollections: 1 });
      console.log('Available collections:', collections);
    }
    
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching new jobs:', error);
    res.status(500).json({ 
      error: "Lỗi server",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Lấy NewJob theo id
export const getNewJobById = async (req: Request, res: Response) => {
  try {
    const job = await prisma.newJob.findUnique({
      where: { id: req.params.id },
    });
    if (!job) return res.status(404).json({ error: "Không tìm thấy job" });
    return res.json(job);
  } catch (error) {
    return res.status(500).json({ error: "Lỗi server" });
  }
};
// Tạo NewJob mới
export const createNewJob = async (req: Request, res: Response) => {
  try {
    const job = await prisma.newJob.create({
      data: req.body,
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Cập nhật NewJob
export const updateNewJob = async (req: Request, res: Response) => {
  try {
    const job = await prisma.newJob.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Xóa NewJob
export const deleteNewJob = async (req: Request, res: Response) => {
  try {
    await prisma.newJob.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Đã xóa job" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi server" });
  }
};