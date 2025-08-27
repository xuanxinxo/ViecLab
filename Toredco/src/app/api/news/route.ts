import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/mongodb';
import { News } from '@/src/models/News';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Hàm upload stream Cloudinary dạng Promise
function uploadToCloudinary(fileBuffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) {
          return reject(new Error('Không thể tải lên hình ảnh lên Cloudinary'));
        }
        resolve(result.secure_url);
      }
    );
    Readable.from(fileBuffer).pipe(uploadStream);
  });
}

// GET: Lấy danh sách tin tức
export async function GET() {
  try {
    console.log('[NEWS API] Connecting to database...');
    await connectDB();
    console.log('[NEWS API] Connected to database, fetching news...');
    
    const news = await News.find().sort({ date: -1 });
    console.log(`[NEWS API] Found ${news.length} news items`);
    
    return NextResponse.json({ news });
  } catch (err) {
    console.error('Error in news API:', {
      error: err,
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
      name: err instanceof Error ? err.name : 'UnknownError'
    });
    
    return NextResponse.json(
      { 
        error: 'Có lỗi xảy ra khi tải danh sách tin tức',
        details: process.env.NODE_ENV === 'development' ? {
          message: err instanceof Error ? err.message : 'Unknown error',
          name: err instanceof Error ? err.name : 'UnknownError'
        } : undefined
      },
      { status: 500 }
    );
  }
}

// POST: Tạo tin tức mới
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title')?.toString() || '';
    const summary = formData.get('summary')?.toString() || '';
    const date = formData.get('date')?.toString() || '';
    const link = formData.get('link')?.toString() || '';
    const imageFile = formData.get('image') as File | null;

    if (!title || !summary || !date) {
      return NextResponse.json(
        { error: 'Thiếu dữ liệu bắt buộc' },
        { status: 400 }
      );
    }

    let imageUrl = '';
    if (imageFile && imageFile.size > 0) {
      try {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        imageUrl = await uploadToCloudinary(buffer, 'news');
      } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
          { error: 'Lỗi khi tải lên hình ảnh' },
          { status: 500 }
        );
      }
    }

    await connectDB();
    
    const newsItem = new News({
      title,
      summary,
      date,
      link: link || '',
      imageUrl: imageUrl || '',
    });

    await newsItem.save();

    return NextResponse.json(
      { success: true, news: newsItem },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating news item:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tạo tin tức mới' },
      { status: 500 }
    );
  }
}

// DELETE: Xóa tin tức
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Thiếu ID tin tức' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    const deletedNews = await News.findByIdAndDelete(id);
    
    if (!deletedNews) {
      return NextResponse.json(
        { error: 'Không tìm thấy tin tức để xóa' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Tin tức đã được xóa thành công' 
    });
    
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi xóa tin tức' },
      { status: 500 }
    );
  }
}
