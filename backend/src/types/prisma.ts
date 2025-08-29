import { Prisma } from '@prisma/client';

// Định nghĩa kiểu dữ liệu cho các bảng
const jobSelect = Prisma.validator<Prisma.JobSelect>()({
  id: true,
  title: true,
  company: true,
  location: true,
  type: true,
});

const hiringSelect = Prisma.validator<Prisma.HiringSelect>()({
  id: true,
  title: true,
  company: true,
  location: true,
  type: true,
});

// Tạo kiểu dữ liệu cho include options
export const applicationInclude = Prisma.validator<Prisma.ApplicationInclude>()({
  job: { select: jobSelect },
  hiring: { select: hiringSelect },
});

// Tạo kiểu dữ liệu trả về
export type ApplicationWithRelations = Prisma.ApplicationGetPayload<{
  include: typeof applicationInclude;
}>;
