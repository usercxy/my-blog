import { Injectable, NotFoundException } from '@nestjs/common';
import { PageStatus } from '@prisma/client';

import { createSlug } from '../../common/utils/slug.util';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PageService {
  constructor(private readonly prismaService: PrismaService) {}

  async getPublicPage(pageKey: string) {
    const page = await this.prismaService.page.findFirst({
      where: {
        pageKey,
        status: PageStatus.PUBLISHED,
      },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }

  async getAdminPage(pageKey: string) {
    const page = await this.prismaService.page.findUnique({
      where: {
        pageKey,
      },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }

  async updatePage(pageKey: string, dto: UpdatePageDto) {
    const existing = await this.prismaService.page.findUnique({
      where: {
        pageKey,
      },
    });

    if (!existing) {
      throw new NotFoundException('Page not found');
    }

    return this.prismaService.page.update({
      where: {
        pageKey,
      },
      data: {
        title: dto.title,
        slug: dto.slug ? createSlug(dto.slug) : undefined,
        summary: dto.summary,
        content: dto.content,
        status: dto.status,
        seoTitle: dto.seoTitle,
        seoKeywords: dto.seoKeywords,
        seoDescription: dto.seoDescription,
      },
    });
  }
}
