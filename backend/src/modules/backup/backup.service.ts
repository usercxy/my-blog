import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BackupService {
  constructor(private readonly prismaService: PrismaService) {}

  async exportData() {
    const [
      posts,
      categories,
      tags,
      pages,
      projects,
      siteSettings,
      mediaFiles,
    ] = await Promise.all([
      this.prismaService.post.findMany({
        include: {
          content: true,
          postCategories: true,
          postTags: true,
        },
      }),
      this.prismaService.category.findMany(),
      this.prismaService.tag.findMany(),
      this.prismaService.page.findMany(),
      this.prismaService.project.findMany(),
      this.prismaService.siteSetting.findMany(),
      this.prismaService.mediaFile.findMany(),
    ]);

    return {
      exportedAt: new Date(),
      format: 'json',
      data: {
        posts,
        categories,
        tags,
        pages,
        projects,
        siteSettings,
        mediaFiles,
      },
    };
  }
}
