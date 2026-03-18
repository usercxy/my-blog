import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getDashboard() {
    const [postCount, categoryCount, tagCount, latestPost, popularVisits] = await Promise.all([
      this.prismaService.post.count(),
      this.prismaService.category.count(),
      this.prismaService.tag.count(),
      this.prismaService.post.findFirst({
        orderBy: {
          updatedAt: 'desc',
        },
      }),
      this.prismaService.visitStat.groupBy({
        by: ['postId'],
        _count: {
          postId: true,
        },
        where: {
          postId: {
            not: null,
          },
        },
        orderBy: {
          _count: {
            postId: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    const popularPostIds = popularVisits
      .map((item) => item.postId)
      .filter((item): item is bigint => item !== null);

    const posts = popularPostIds.length
      ? await this.prismaService.post.findMany({
          where: {
            id: {
              in: popularPostIds,
            },
          },
        })
      : [];

    const postMap = new Map(posts.map((post) => [post.id.toString(), post]));

    return {
      postCount,
      categoryCount,
      tagCount,
      latestUpdatedAt: latestPost?.updatedAt ?? null,
      popularPosts: popularVisits
        .map((visit) => {
          const postId = visit.postId?.toString();
          const post = postId ? postMap.get(postId) : null;

          if (!post) {
            return null;
          }

          return {
            id: post.id,
            title: post.title,
            slug: post.slug,
            visits: visit._count.postId,
          };
        })
        .filter(Boolean),
    };
  }
}
