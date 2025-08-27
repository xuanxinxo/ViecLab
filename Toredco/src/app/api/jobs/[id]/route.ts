import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '../../../../lib/api';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: 'Job ID is required' }, 
        { status: 400 }
      );
    }

    const response = await apiClient.jobs.getById(id);
    if (!response.data) {
      return NextResponse.json(
        { error: 'Job not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: 'Job ID is required' }, 
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const image = formData.get('img') as File | null;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' }, 
        { status: 400 }
      );
    }

    let imageUrl = '';

    if (image) {
      try {
        // Validate image type
        if (!image.type.startsWith('image/')) {
          return NextResponse.json(
            { error: 'Invalid image format' }, 
            { status: 400 }
          );
        }

        // Validate image size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (image.size > maxSize) {
          return NextResponse.json(
            { error: 'Image size exceeds 5MB limit' }, 
            { status: 400 }
          );
        }

        // Create uploads directory
        const uploadsDir = join(process.cwd(), 'public/uploads/jobs');
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const ext = image.name.split('.').pop();
        const filename = `${timestamp}.${ext}`;
        const filePath = join(uploadsDir, filename);

        // Convert image to buffer and save
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        imageUrl = `/uploads/jobs/${filename}`;
      } catch (error) {
        console.error('Error processing image:', error);
        return NextResponse.json(
          { error: 'Failed to process image' },
          { status: 500 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      title,
      description,
    };
    
    if (imageUrl) {
      updateData.img = imageUrl;
    }

    // Update job using API client
    const response = await apiClient.jobs.update(id, updateData);
    
    if (!response.data) {
      throw new Error('Failed to update job');
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: 'Job ID is required' }, 
        { status: 400 }
      );
    }

    // Delete job using API client
    const response = await apiClient.jobs.delete(id);
    
    if (!response.data) {
      throw new Error('Failed to delete job');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}
