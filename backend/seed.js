import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Tạo user test đã được verify
  const hashedPassword = await bcrypt.hash('123456', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      isEmailVerified: true,
      role: 'USER'
    }
  });
  console.log(`✅ Created/Updated test user: ${testUser.email}`);

  // Tạo jobs mẫu
  const sampleJobs = [
    {
      title: 'Frontend Developer React',
      company: 'TechCorp Vietnam',
      location: 'Hồ Chí Minh',
      type: 'Full-time',
      salary: '25.000.000 - 35.000.000 VND',
      status: 'pending',
      description: 'Chúng tôi đang tìm kiếm một Frontend Developer có kinh nghiệm với React',
      requirements: ['React', 'TypeScript', 'CSS/SCSS', 'Git'],
      benefits: ['Bảo hiểm y tế', 'Thưởng dự án', 'Đào tạo'],
      tags: ['React', 'Frontend', 'JavaScript'],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      postedDate: new Date(),
      isRemote: false,
      img: '/img/tech.jpg'
    },
    {
      title: 'Backend Developer Node.js',
      company: 'StartupHub',
      location: 'Hà Nội',
      type: 'Full-time',
      salary: '20.000.000 - 30.000.000 VND',
      status: 'active',
      description: 'Tuyển dụng Backend Developer với Node.js và MongoDB',
      requirements: ['Node.js', 'Express', 'MongoDB', 'REST API'],
      benefits: ['Lương cạnh tranh', 'Môi trường trẻ trung', 'Stock options'],
      tags: ['Node.js', 'Backend', 'MongoDB'],
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      postedDate: new Date(),
      isRemote: true,
      img: '/img/startup.jpg'
    },
    {
      title: 'UI/UX Designer',
      company: 'Creative Studio',
      location: 'Đà Nẵng',
      type: 'Part-time',
      salary: '15.000.000 - 20.000.000 VND',
      status: 'pending',
      description: 'Tuyển dụng UI/UX Designer sáng tạo',
      requirements: ['Figma', 'Adobe Creative Suite', 'Prototyping'],
      benefits: ['Linh hoạt thời gian', 'Dự án đa dạng'],
      tags: ['UI/UX', 'Design', 'Figma'],
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      postedDate: new Date(),
      isRemote: false,
      img: '/img/design.jpg'
    }
  ];

  for (const jobData of sampleJobs) {
    const job = await prisma.job.create({
      data: jobData
    });
    console.log(`✅ Created job: ${job.title}`);
  }

  // Tạo hirings mẫu
  const sampleHirings = [
    {
      title: 'Mobile Developer Flutter',
      company: 'AppStudio',
      location: 'Hồ Chí Minh',
      type: 'Contract',
      salary: '30.000.000 - 40.000.000 VND',
      description: 'Tuyển dụng Mobile Developer Flutter',
      requirements: ['Flutter', 'Dart', 'Mobile Development'],
      benefits: ['Lương cao', 'Dự án thú vị'],
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      postedDate: new Date(),
      img: '/img/mobile.jpg'
    },
    {
      title: 'DevOps Engineer',
      company: 'CloudTech',
      location: 'Remote',
      type: 'Full-time',
      salary: '35.000.000 - 45.000.000 VND',
      description: 'Tuyển dụng DevOps Engineer',
      requirements: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
      benefits: ['Remote work', 'Lương cạnh tranh'],
      deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      postedDate: new Date(),
      img: '/img/devops.jpg'
    }
  ];

  for (const hiringData of sampleHirings) {
    const hiring = await prisma.hiring.create({
      data: hiringData
    });
    console.log(`✅ Created hiring: ${hiring.title}`);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
