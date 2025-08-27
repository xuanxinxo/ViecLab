import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
import { prisma } from '@/src/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const hiring = await prisma.hiring.findUnique({
    where: { id: params.id },
  });
  if (!hiring)
    return NextResponse.json(
      { success: false, message: 'Không tìm thấy tin' },
      { status: 404 }
    );
  return NextResponse.json({ success: true, data: hiring });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.hiring.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Cập nhật không thành công' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.hiring.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Xóa không thành công' }, { status: 500 });
  }
}
