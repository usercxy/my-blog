import { Controller, Get, Header, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { PageStatus, PostStatus, ProjectStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { SiteService } from '../site/site.service';

@ApiTags('public')
@Controller()
export class SeoController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly siteService: SiteService,
  ) {}

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async sitemap(@Res() response: Response) {
    const [siteSetting, posts, categories, tags, pages, projects] = await Promise.all([
      this.siteService.getSettings(),
      this.prismaService.post.findMany({
        where: {
          status: PostStatus.PUBLISHED,
        },
        select: {
          slug: true,
        },
      }),
      this.prismaService.category.findMany({
        select: {
          slug: true,
        },
      }),
      this.prismaService.tag.findMany({
        select: {
          slug: true,
        },
      }),
      this.prismaService.page.findMany({
        where: {
          status: PageStatus.PUBLISHED,
        },
        select: {
          slug: true,
        },
      }),
      this.prismaService.project.findMany({
        where: {
          status: ProjectStatus.PUBLISHED,
        },
        select: {
          slug: true,
        },
      }),
    ]);

    const baseUrl = siteSetting.siteUrl ?? 'http://localhost:3000';
    const urls = [
      `${baseUrl}/`,
      `${baseUrl}/about`,
      ...posts.map((item) => `${baseUrl}/posts/${item.slug}`),
      ...categories.map((item) => `${baseUrl}/categories/${item.slug}`),
      ...tags.map((item) => `${baseUrl}/tags/${item.slug}`),
      ...pages.map((item) => `${baseUrl}/${item.slug}`),
      ...projects.map((item) => `${baseUrl}/projects/${item.slug}`),
    ];

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map((url) => `<url><loc>${url}</loc></url>`),
      '</urlset>',
    ].join('');

    response.send(xml);
  }

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  async robots(@Res() response: Response) {
    const siteSetting = await this.siteService.getSettings();
    const baseUrl = siteSetting.siteUrl ?? 'http://localhost:3000';
    response.send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/api/sitemap.xml\n`);
  }
}
