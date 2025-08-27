import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/mongodb';
import { News } from '@/src/models/News';


// PUT: Cập nhật tin tức
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== UPDATE NEWS API CALLED ===');
    console.log('Content-Type:', request.headers.get('content-type'));
    console.log('News ID:', params.id);
    
    // Validate news ID
    if (!params.id || params.id === 'undefined') {
      console.error('Invalid news ID:', params.id);
      return NextResponse.json(
        { error: 'ID tin tức không hợp lệ' },
        { status: 400 }
      );
    }
    
    const contentType = request.headers.get('content-type') || '';
    let title, summary, date, link, imageUrl;

    if (contentType.includes('multipart/form-data')) {
      console.log('Processing FormData (with image)');
      
      // Create a new FormData from the request body
      const formData = await request.formData();
      
      // Get text fields from form data
      title = formData.get('title')?.toString() || '';
      summary = formData.get('summary')?.toString() || '';
      date = formData.get('date')?.toString() || '';
      link = formData.get('link')?.toString() || '';
      
      console.log('Form data received:', { title, summary, date, link });
      
      // Get the image file from form data
      const imageFile = formData.get('image');
      console.log('Image file received:', imageFile ? 'Yes' : 'No');
      
if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        console.log('Processing image file:', {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type
        });
        
        try {
          console.log('Starting Cloudinary upload...');
          console.log('Cloudinary config:', {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
            api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
            api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
          });
          
          // Upload lên Cloudinary
          const { v2: cloudinary } = await import('cloudinary');
          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          });

          const buffer = Buffer.from(await imageFile.arrayBuffer());
          const base64Image = buffer.toString('base64');
          const dataURI = `data:${imageFile.type};base64,${base64Image}`;
          
          console.log('Uploading to Cloudinary...');
          const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'news',
            public_id: `news_${Date.now()}`,
            overwrite: true,
          });
          
          imageUrl = result.secure_url;
          console.log('✅ Image uploaded to Cloudinary successfully:', imageUrl);
        } catch (cloudinaryErr) {
          console.error('❌ Error uploading to Cloudinary:', cloudinaryErr);
          console.log('Falling back to local storage...');
          
          // Fallback: thử lưu local nếu có thể
          try {
            const fs = await import('fs/promises');
            const path = await import('path');
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const filename = `${Date.now()}_${imageFile.name}`;
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');
            await fs.mkdir(uploadDir, { recursive: true });
            await fs.writeFile(path.join(uploadDir, filename), buffer);
            imageUrl = `/uploads/${filename}`;
            console.log('✅ Image saved locally:', imageUrl);
          } catch (localErr) {
            console.error('❌ Failed to save image:', localErr);
            return NextResponse.json(
              { error: 'Không thể lưu ảnh. Vui lòng thử lại.' },
              { status: 500 }
            );
          }
        }
      } else {
        console.log('No image file provided or file is empty');
      }
    } else {
      console.log('Processing JSON (text only)');
      // Xử lý JSON (chỉ text)
      const body = await request.json();
      title = body.title;
      summary = body.summary;
      date = body.date;
      link = body.link;
      console.log('JSON data received:', { title, summary, date, link });
    }

    if (!title || !summary || !date) {
      return NextResponse.json(
        { error: 'Thiếu dữ liệu bắt buộc' },
        { status: 400 }
      );
    }

    await connectDB();
    
    console.log('Final update data:', { title, summary, date, link, imageUrl });
    
    const updateData: any = { 
      title: title.trim(),
      summary: summary.trim(),
      date: date,
      ...(link && { link: link.trim() }),
      ...(imageUrl && { image: imageUrl })
    };
    
    console.log('Updating database with ID:', params.id, 'and data:', updateData);
    
    const updatedNews = await News.findByIdAndUpdate(
      params.id.trim(),
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedNews) {
      console.error('News not found with ID:', params.id);
      return NextResponse.json(
        { error: 'Không tìm thấy tin tức để cập nhật' },
        { status: 404 }
      );
    }

    if (!updatedNews) {
      return NextResponse.json(
        { error: 'Không tìm thấy tin tức' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      news: updatedNews,
      message: 'Cập nhật tin tức thành công'
    });

  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// GET: Lấy chi tiết tin tức theo ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const news = await News.findById(params.id);
    
    if (!news) {
      return NextResponse.json(
        { error: 'Không tìm thấy tin tức' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, news });

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
