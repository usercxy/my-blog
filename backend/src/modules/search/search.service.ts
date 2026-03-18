import { Injectable } from '@nestjs/common';
import { PostStatus } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prismaService: PrismaService) {}

  async search(query: SearchQueryDto) {
    const keyword = query.keyword?.trim();

    if (!keyword) {
      return {
        items: [],
        total: 0,
        page: query.page,
        pageSize: query.pageSize,
      };
    }

    const where = {
      status: PostStatus.PUBLISHED,
      OR: [
        {
          title: {
            contains: keyword,
            mode: 'insensitive' as const,
          },
        },
        {
          summary: {
            contains: keyword,
            mode: 'insensitive' as const,
          },
        },
        {
          content: {
            markdownContent: {
              contains: keyword,
              mode: 'insensitive' as const,
            },
          },
        },
        {
          postTags: {
            some: {
              tag: {
                name: {
                  contains: keyword,
                  mode: 'insensitive' as const,
                },
              },
            },
          },
        },
      ],
    };

    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await Promise.all([
      this.prismaService.post.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: {
          publishedAt: 'desc',
        },
        include: {
          content: true,
          postCategories: {
            include: {
              category: true,
            },
          },
          postTags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      this.prismaService.post.count({ where }),
    ]);

    await this.prismaService.searchLog.create({
      data: {
        keyword,
        resultCount: total,
      },
    });

    return {
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        publishedAt: item.publishedAt,
        snippet: item.content?.markdownContent.slice(0, 180) ?? '',
        categories: item.postCategories.map((relation) => relation.category),
        tags: item.postTags.map((relation) => relation.tag),
      })),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }
}
