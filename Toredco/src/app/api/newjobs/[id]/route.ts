import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/src/lib/prisma';


export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.newJob.findUnique({ where: { id: params.id } });
    if (!job) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    console.error('GET /api/newjobs/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}


