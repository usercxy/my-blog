import { PrismaClient, PostStatus, PageStatus, ProjectStatus, MediaStorage } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await hash('admin123456', 10);

  const admin = await prisma.user.upsert({
    where: {
      username: 'admin',
    },
    update: {
      displayName: '博客管理员',
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      isActive: true,
    },
    create: {
      username: 'admin',
      passwordHash: adminPasswordHash,
      displayName: '博客管理员',
      email: 'admin@example.com',
      isActive: true,
    },
  });

  const category = await prisma.category.upsert({
    where: {
      slug: 'backend-architecture',
    },
    update: {
      name: '后端架构',
      description: '后端工程、架构设计与服务治理相关文章。',
    },
    create: {
      name: '后端架构',
      slug: 'backend-architecture',
      description: '后端工程、架构设计与服务治理相关文章。',
    },
  });

  const tagNest = await prisma.tag.upsert({
    where: {
      slug: 'nestjs',
    },
    update: {
      name: 'NestJS',
    },
    create: {
      name: 'NestJS',
      slug: 'nestjs',
    },
  });

  const tagPrisma = await prisma.tag.upsert({
    where: {
      slug: 'prisma',
    },
    update: {
      name: 'Prisma',
    },
    create: {
      name: 'Prisma',
      slug: 'prisma',
    },
  });

  const post = await prisma.post.upsert({
    where: {
      slug: 'backend-demo-online',
    },
    update: {
      title: '个人博客后端 Demo 已启动',
      summary: 'NestJS + Prisma + PostgreSQL 基础框架已经就绪。',
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: admin.id,
      isTop: true,
      seoTitle: '个人博客后端 Demo 已启动',
      seoKeywords: 'NestJS, Prisma, PostgreSQL',
      seoDescription: '个人博客后端框架初始化完成，数据库连接可用。',
    },
    create: {
      title: '个人博客后端 Demo 已启动',
      slug: 'backend-demo-online',
      summary: 'NestJS + Prisma + PostgreSQL 基础框架已经就绪。',
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: admin.id,
      isTop: true,
      seoTitle: '个人博客后端 Demo 已启动',
      seoKeywords: 'NestJS, Prisma, PostgreSQL',
      seoDescription: '个人博客后端框架初始化完成，数据库连接可用。',
    },
  });

  await prisma.postContent.upsert({
    where: {
      postId: post.id,
    },
    update: {
      markdownContent: [
        '# 个人博客后端 Demo',
        '',
        '当前项目已经完成以下基础能力：',
        '',
        '- NestJS 服务启动',
        '- Prisma 与 PostgreSQL 连接',
        '- 统一响应和异常处理',
        '- Swagger 接口文档',
        '',
        '接下来可以继续进入文章、分类、标签、鉴权等业务开发。',
      ].join('\n'),
      htmlContent:
        '<h1>个人博客后端 Demo</h1><p>当前项目已经完成基础框架搭建，可继续进行业务开发。</p>',
      wordCount: 53,
      readingTime: 1,
    },
    create: {
      postId: post.id,
      markdownContent: [
        '# 个人博客后端 Demo',
        '',
        '当前项目已经完成以下基础能力：',
        '',
        '- NestJS 服务启动',
        '- Prisma 与 PostgreSQL 连接',
        '- 统一响应和异常处理',
        '- Swagger 接口文档',
        '',
        '接下来可以继续进入文章、分类、标签、鉴权等业务开发。',
      ].join('\n'),
      htmlContent:
        '<h1>个人博客后端 Demo</h1><p>当前项目已经完成基础框架搭建，可继续进行业务开发。</p>',
      wordCount: 53,
      readingTime: 1,
    },
  });

  await prisma.postCategory.upsert({
    where: {
      postId_categoryId: {
        postId: post.id,
        categoryId: category.id,
      },
    },
    update: {},
    create: {
      postId: post.id,
      categoryId: category.id,
    },
  });

  await prisma.postTag.upsert({
    where: {
      postId_tagId: {
        postId: post.id,
        tagId: tagNest.id,
      },
    },
    update: {},
    create: {
      postId: post.id,
      tagId: tagNest.id,
    },
  });

  await prisma.postTag.upsert({
    where: {
      postId_tagId: {
        postId: post.id,
        tagId: tagPrisma.id,
      },
    },
    update: {},
    create: {
      postId: post.id,
      tagId: tagPrisma.id,
    },
  });

  await prisma.page.upsert({
    where: {
      pageKey: 'about',
    },
    update: {
      title: '关于我',
      slug: 'about',
      summary: '个人博客关于页',
      content: '这里是关于页示例内容，后续可在后台管理中维护。',
      status: PageStatus.PUBLISHED,
      seoTitle: '关于我',
      seoKeywords: '关于, 博客',
      seoDescription: '个人博客关于页示例内容。',
    },
    create: {
      pageKey: 'about',
      title: '关于我',
      slug: 'about',
      summary: '个人博客关于页',
      content: '这里是关于页示例内容，后续可在后台管理中维护。',
      status: PageStatus.PUBLISHED,
      seoTitle: '关于我',
      seoKeywords: '关于, 博客',
      seoDescription: '个人博客关于页示例内容。',
    },
  });

  await prisma.project.upsert({
    where: {
      slug: 'personal-blog-platform',
    },
    update: {
      title: 'Personal Blog Platform',
      summary: '个人博客前后端一体化平台示例项目。',
      content: '用于演示文章管理、公开接口和后台管理能力的项目。',
      status: ProjectStatus.PUBLISHED,
      sortOrder: 1,
      repoUrl: 'https://example.com/repo/personal-blog-platform',
      previewUrl: 'https://example.com/personal-blog-platform',
    },
    create: {
      title: 'Personal Blog Platform',
      slug: 'personal-blog-platform',
      summary: '个人博客前后端一体化平台示例项目。',
      content: '用于演示文章管理、公开接口和后台管理能力的项目。',
      status: ProjectStatus.PUBLISHED,
      sortOrder: 1,
      repoUrl: 'https://example.com/repo/personal-blog-platform',
      previewUrl: 'https://example.com/personal-blog-platform',
    },
  });

  await prisma.siteSetting.upsert({
    where: {
      id: 1n,
    },
    update: {
      siteName: '个人博客',
      siteDescription: '基于 NestJS + Prisma + PostgreSQL 的个人博客系统。',
      siteUrl: 'http://localhost:3000',
      seoTitle: '个人博客',
      seoKeywords: '博客, NestJS, Prisma, PostgreSQL',
      seoDescription: '个人博客系统基础框架已完成，支持后续业务模块开发。',
      skills: ['Vue 3', 'Nuxt 3', 'TypeScript', 'Node.js', '产品设计', 'SEO'],
      experiences: [
        {
          period: '2024 - 至今',
          title: '独立内容平台建设',
          description: '围绕技术写作、产品复盘和项目展示，搭建个人内容品牌。',
        },
        {
          period: '2021 - 2024',
          title: '前端与体验设计实践',
          description: '负责企业级中后台、增长活动页和内容平台的前端架构与体验优化。',
        },
      ],
      contactEmail: 'hello@example.com',
      socialLinks: [
        { label: 'GitHub', href: 'https://github.com/' },
        { label: 'X', href: 'https://x.com/' },
        { label: 'Email', href: 'mailto:hello@example.com' },
      ],
    },
    create: {
      id: 1n,
      siteName: '个人博客',
      siteDescription: '基于 NestJS + Prisma + PostgreSQL 的个人博客系统。',
      siteUrl: 'http://localhost:3000',
      seoTitle: '个人博客',
      seoKeywords: '博客, NestJS, Prisma, PostgreSQL',
      seoDescription: '个人博客系统基础框架已完成，支持后续业务模块开发。',
      skills: ['Vue 3', 'Nuxt 3', 'TypeScript', 'Node.js', '产品设计', 'SEO'],
      experiences: [
        {
          period: '2024 - 至今',
          title: '独立内容平台建设',
          description: '围绕技术写作、产品复盘和项目展示，搭建个人内容品牌。',
        },
        {
          period: '2021 - 2024',
          title: '前端与体验设计实践',
          description: '负责企业级中后台、增长活动页和内容平台的前端架构与体验优化。',
        },
      ],
      contactEmail: 'hello@example.com',
      socialLinks: [
        { label: 'GitHub', href: 'https://github.com/' },
        { label: 'X', href: 'https://x.com/' },
        { label: 'Email', href: 'mailto:hello@example.com' },
      ],
    },
  });

  await prisma.mediaFile.upsert({
    where: {
      id: 1n,
    },
    update: {
      filename: 'demo-cover.png',
      originalName: 'demo-cover.png',
      mimeType: 'image/png',
      storage: MediaStorage.LOCAL,
      path: '/uploads/demo-cover.png',
      size: 1024,
    },
    create: {
      id: 1n,
      filename: 'demo-cover.png',
      originalName: 'demo-cover.png',
      mimeType: 'image/png',
      storage: MediaStorage.LOCAL,
      path: '/uploads/demo-cover.png',
      size: 1024,
    },
  });

  const visitStatCount = await prisma.visitStat.count({
    where: {
      path: '/posts/backend-demo-online',
      userAgent: 'seed-script',
    },
  });

  if (visitStatCount === 0) {
    await prisma.visitStat.create({
      data: {
        postId: post.id,
        path: '/posts/backend-demo-online',
        ip: '127.0.0.1',
        userAgent: 'seed-script',
      },
    });
  }

  const searchLogCount = await prisma.searchLog.count({
    where: {
      keyword: 'nestjs',
      resultCount: 1,
    },
  });

  if (searchLogCount === 0) {
    await prisma.searchLog.create({
      data: {
        keyword: 'nestjs',
        resultCount: 1,
      },
    });
  }

  const operationLogCount = await prisma.operationLog.count({
    where: {
      action: 'seed',
      resource: 'system',
      resourceId: 'bootstrap',
    },
  });

  if (operationLogCount === 0) {
    await prisma.operationLog.create({
      data: {
        userId: admin.id,
        action: 'seed',
        resource: 'system',
        resourceId: 'bootstrap',
        detail: {
          message: 'Initial demo data seeded successfully.',
        },
        ip: '127.0.0.1',
      },
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
