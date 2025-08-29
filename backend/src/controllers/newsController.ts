import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Lấy tất cả tin tức
export const getAllNews = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const news = await prisma.news.findMany();
    return res.status(200).json(news);
  } catch (error) {
    console.error('Error getting news:', error);
    return res.status(500).json({ error: 'Failed to get news' });
  }
};

// Tạo tin tức mới
export const createNews = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { title, summary, image, link, date } = req.body;

    if (!title || !summary || !image || !link) {
      return res.status(400).json({ error: 'Title, summary, image and link are required' });
    }

    const news = await prisma.news.create({
      data: {
        title,
        summary,
        image,
        link,
        date: date || new Date().toISOString(),
        v: 1,
      },
    });

    return res.status(201).json(news);
  } catch (error) {
    console.error('Error creating news:', error);
    return res.status(500).json({ error: 'Failed to create news' });
  }
};

// Lấy chi tiết tin tức
export const getNewsById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const newsItem = await prisma.news.findUnique({
      where: { id },
    });

    if (!newsItem) {
      return res.status(404).json({ error: 'News not found' });
    }

    return res.status(200).json(newsItem);
  } catch (error) {
    console.error('Error getting news:', error);
    return res.status(500).json({ error: 'Failed to get news' });
  }
};

// Cập nhật tin tức
export const updateNews = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { title, summary, image, link, date } = req.body;

    const updatedNews = await prisma.news.update({
      where: { id },
      data: {
        title,
        summary,
        image,
        link,
        date,
      },
    });

    return res.status(200).json(updatedNews);
  } catch (error) {
    console.error('Error updating news:', error);
    return res.status(500).json({ error: 'Failed to update news' });
  }
};

// Xóa tin tức
export const deleteNews = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    await prisma.news.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    return res.status(500).json({ error: 'Failed to delete news' });
  }
};
