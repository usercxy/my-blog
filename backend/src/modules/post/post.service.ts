import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostStatus, Prisma } from '@prisma/client';

import { calculateContentMetrics } from '../../common/utils/content-metrics.util';
import { createSlug } from '../../common/utils/slug.util';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminPostQueryDto } from './dto/admin-post-query.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { PublicPostQueryDto } from './dto/public-post-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UpdatePostStatusDto } from './dto/update-post-status.dto';

const postInclude = {
  author: true,
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
} satisfies Prisma.PostInclude;

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}

  async listAdmin(query: AdminPostQueryDto) {
    const where = this.buildWhere(query, false);
    const skip = (query.page - 1) * query.pageSize;

    const [items, total] = await Promise.all([
      this.prismaService.post.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: [{ isTop: 'desc' }, { updatedAt: 'desc' }],
        include: postInclude,
      }),
      this.prismaService.post.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toPostSummary(item)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async getAdminDetail(id: string) {
    const post = await this.findPostById(BigInt(id));
    return this.toPostDetail(post);
  }

  async create(dto: CreatePostDto, userId: string) {
    const status = dto.status ?? PostStatus.DRAFT;
    await this.validatePostPayload(dto, status);

    const slug = dto.slug ? createSlug(dto.slug) : createSlug(dto.title);
    await this.ensureSlugAvailable(slug);
    await this.ensureCategoriesExist(dto.categoryIds);
    await this.ensureTagsExist(dto.tagIds ?? []);

    const metrics = calculateContentMetrics(dto.markdownContent);

    const post = await this.prismaService.$transaction(async (tx) => {
      const createdPost = await tx.post.create({
        data: {
          title: dto.title,
          slug,
          summary: dto.summary,
          cover: dto.cover,
          status,
          authorId: BigInt(userId),
          isTop: dto.isTop ?? false,
          publishedAt: status === PostStatus.PUBLISHED ? new Date() : null,
          seoTitle: dto.seoTitle,
          seoKeywords: dto.seoKeywords,
          seoDescription: dto.seoDescription,
        },
      });

      await tx.postContent.create({
        data: {
          postId: createdPost.id,
          markdownContent: dto.markdownContent,
          htmlContent: dto.htmlContent,
          tocJson: dto.tocJson as Prisma.InputJsonValue | undefined,
          wordCount: metrics.wordCount,
          readingTime: metrics.readingTime,
        },
      });

      await tx.postCategory.createMany({
        data: dto.categoryIds.map((categoryId) => ({
          postId: createdPost.id,
          categoryId: BigInt(categoryId),
        })),
      });

      if ((dto.tagIds ?? []).length > 0) {
        await tx.postTag.createMany({
          data: (dto.tagIds ?? []).map((tagId) => ({
            postId: createdPost.id,
            tagId: BigInt(tagId),
          })),
        });
      }

      return tx.post.findUniqueOrThrow({
        where: {
          id: createdPost.id,
        },
        include: postInclude,
      });
    });

    return this.toPostDetail(post);
  }

  async update(id: string, dto: UpdatePostDto) {
    const postId = BigInt(id);
    const existing = await this.findPostById(postId);
    const nextStatus = dto.status ?? existing.status;
    const merged = {
      title: dto.title ?? existing.title,
      markdownContent: dto.markdownContent ?? existing.content?.markdownContent ?? '',
      categoryIds:
        dto.categoryIds ?? existing.postCategories.map((item) => item.categoryId.toString()),
    } as CreatePostDto;

    await this.validatePostPayload(merged, nextStatus);

    if (dto.slug || dto.title) {
      const nextSlug = dto.slug ? createSlug(dto.slug) : createSlug(dto.title ?? existing.title);
      await this.ensureSlugAvailable(nextSlug, postId);
    }

    if (dto.categoryIds) {
      await this.ensureCategoriesExist(dto.categoryIds);
    }

    if (dto.tagIds) {
      await this.ensureTagsExist(dto.tagIds);
    }

    const markdownContent = dto.markdownContent ?? existing.content?.markdownContent ?? '';
    const metrics = calculateContentMetrics(markdownContent);

    const updated = await this.prismaService.$transaction(async (tx) => {
      await tx.post.update({
        where: {
          id: postId,
        },
        data: {
          title: dto.title,
          slug: dto.slug
            ? createSlug(dto.slug)
            : dto.title
              ? createSlug(dto.title)
              : undefined,
          summary: dto.summary,
          cover: dto.cover,
          status: nextStatus,
          isTop: dto.isTop,
          publishedAt:
            nextStatus === PostStatus.PUBLISHED
              ? existing.publishedAt ?? new Date()
              : nextStatus === PostStatus.DRAFT
                ? null
                : existing.publishedAt,
          seoTitle: dto.seoTitle,
          seoKeywords: dto.seoKeywords,
          seoDescription: dto.seoDescription,
        },
      });

      if (dto.markdownContent || dto.htmlContent || dto.tocJson || existing.content) {
        await tx.postContent.upsert({
          where: {
            postId,
          },
          update: {
            markdownContent,
            htmlContent: dto.htmlContent,
            tocJson: dto.tocJson as Prisma.InputJsonValue | undefined,
            wordCount: metrics.wordCount,
            readingTime: metrics.readingTime,
          },
          create: {
            postId,
            markdownContent,
            htmlContent: dto.htmlContent,
            tocJson: dto.tocJson as Prisma.InputJsonValue | undefined,
            wordCount: metrics.wordCount,
            readingTime: metrics.readingTime,
          },
        });
      }

      if (dto.categoryIds) {
        await tx.postCategory.deleteMany({
          where: {
            postId,
          },
        });

        await tx.postCategory.createMany({
          data: dto.categoryIds.map((categoryId) => ({
            postId,
            categoryId: BigInt(categoryId),
          })),
        });
      }

      if (dto.tagIds) {
        await tx.postTag.deleteMany({
          where: {
            postId,
          },
        });

        if (dto.tagIds.length > 0) {
          await tx.postTag.createMany({
            data: dto.tagIds.map((tagId) => ({
              postId,
              tagId: BigInt(tagId),
            })),
          });
        }
      }

      return tx.post.findUniqueOrThrow({
        where: {
          id: postId,
        },
        include: postInclude,
      });
    });

    return this.toPostDetail(updated);
  }

  async updateStatus(id: string, dto: UpdatePostStatusDto) {
    const post = await this.findPostById(BigInt(id));
    await this.validatePostPayload(
      {
        title: post.title,
        markdownContent: post.content?.markdownContent ?? '',
        categoryIds: post.postCategories.map((item) => item.categoryId.toString()),
      } as CreatePostDto,
      dto.status,
    );

    const updated = await this.prismaService.post.update({
      where: {
        id: post.id,
      },
      data: {
        status: dto.status,
        publishedAt:
          dto.status === PostStatus.PUBLISHED
            ? post.publishedAt ?? new Date()
            : dto.status === PostStatus.DRAFT
              ? null
              : post.publishedAt,
      },
      include: postInclude,
    });

    return this.toPostDetail(updated);
  }

  async remove(id: string) {
    const postId = BigInt(id);
    await this.findPostById(postId);

    await this.prismaService.post.delete({
      where: {
        id: postId,
      },
    });

    return {
      deletedId: postId,
    };
  }

  async listPublic(query: PublicPostQueryDto) {
    const where = this.buildWhere(query, true);
    const skip = (query.page - 1) * query.pageSize;

    const [items, total] = await Promise.all([
      this.prismaService.post.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: [{ isTop: 'desc' }, { publishedAt: 'desc' }],
        include: postInclude,
      }),
      this.prismaService.post.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toPostSummary(item)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async getPublicBySlug(slug: string) {
    const post = await this.prismaService.post.findFirst({
      where: {
        slug,
        status: PostStatus.PUBLISHED,
      },
      include: postInclude,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.prismaService.visitStat.create({
      data: {
        postId: post.id,
        path: `/posts/${slug}`,
      },
    });

    return this.toPostDetail(post);
  }

  async listArchive() {
    const items = await this.prismaService.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      include: postInclude,
    });

    const archives = new Map<string, { year: number; month: number; posts: unknown[] }>();

    for (const item of items) {
      if (!item.publishedAt) {
        continue;
      }

      const year = item.publishedAt.getFullYear();
      const month = item.publishedAt.getMonth() + 1;
      const key = `${year}-${month}`;

      if (!archives.has(key)) {
        archives.set(key, {
          year,
          month,
          posts: [],
        });
      }

      archives.get(key)?.posts.push(this.toPostSummary(item));
    }

    return Array.from(archives.values());
  }

  async listForHome() {
    const [featuredPosts, latestPosts] = await Promise.all([
      this.prismaService.post.findMany({
        where: {
          status: PostStatus.PUBLISHED,
          isTop: true,
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: 5,
        include: postInclude,
      }),
      this.prismaService.post.findMany({
        where: {
          status: PostStatus.PUBLISHED,
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: 10,
        include: postInclude,
      }),
    ]);

    return {
      featuredPosts: featuredPosts.map((item) => this.toPostSummary(item)),
      latestPosts: latestPosts.map((item) => this.toPostSummary(item)),
    };
  }

  private buildWhere(
    query: Pick<AdminPostQueryDto, 'keyword' | 'status' | 'categoryId' | 'tagId'>,
    publishedOnly: boolean,
  ): Prisma.PostWhereInput {
    const where: Prisma.PostWhereInput = {};

    if (publishedOnly) {
      where.status = PostStatus.PUBLISHED;
    } else if (query.status) {
      where.status = query.status;
    }

    if (query.keyword) {
      where.OR = [
        {
          title: {
            contains: query.keyword,
            mode: 'insensitive',
          },
        },
        {
          summary: {
            contains: query.keyword,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (query.categoryId) {
      where.postCategories = {
        some: {
          categoryId: BigInt(query.categoryId),
        },
      };
    }

    if (query.tagId) {
      where.postTags = {
        some: {
          tagId: BigInt(query.tagId),
        },
      };
    }

    return where;
  }

  private async findPostById(id: bigint) {
    const post = await this.prismaService.post.findUnique({
      where: {
        id,
      },
      include: postInclude,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  private async validatePostPayload(
    dto: Pick<CreatePostDto, 'title' | 'markdownContent' | 'categoryIds'>,
    status: PostStatus,
  ) {
    if (status !== PostStatus.PUBLISHED) {
      return;
    }

    if (!dto.title?.trim()) {
      throw new BadRequestException('发布文章时标题不能为空');
    }

    if (!dto.markdownContent?.trim()) {
      throw new BadRequestException('发布文章时正文不能为空');
    }

    if (!dto.categoryIds || dto.categoryIds.length === 0) {
      throw new BadRequestException('发布文章时至少需要一个分类');
    }
  }

  private async ensureSlugAvailable(slug: string, ignoreId?: bigint) {
    const existing = await this.prismaService.post.findUnique({
      where: {
        slug,
      },
    });

    if (existing && existing.id !== ignoreId) {
      throw new ConflictException('Post slug already exists');
    }
  }

  private async ensureCategoriesExist(categoryIds: string[]) {
    const ids = categoryIds.map((item) => BigInt(item));
    const count = await this.prismaService.category.count({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (count !== ids.length) {
      throw new BadRequestException('存在无效的分类 ID');
    }
  }

  private async ensureTagsExist(tagIds: string[]) {
    if (tagIds.length === 0) {
      return;
    }

    const ids = tagIds.map((item) => BigInt(item));
    const count = await this.prismaService.tag.count({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (count !== ids.length) {
      throw new BadRequestException('存在无效的标签 ID');
    }
  }

  private toPostSummary(post: Prisma.PostGetPayload<{ include: typeof postInclude }>) {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      cover: post.cover,
      status: post.status,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      isTop: post.isTop,
      seoTitle: post.seoTitle,
      seoKeywords: post.seoKeywords,
      seoDescription: post.seoDescription,
      author: post.author
        ? {
            id: post.author.id,
            username: post.author.username,
            displayName: post.author.displayName,
            avatar: post.author.avatar,
          }
        : null,
      categories: post.postCategories.map((item) => item.category),
      tags: post.postTags.map((item) => item.tag),
      wordCount: post.content?.wordCount ?? 0,
      readingTime: post.content?.readingTime ?? 0,
    };
  }

  private toPostDetail(post: Prisma.PostGetPayload<{ include: typeof postInclude }>) {
    return {
      ...this.toPostSummary(post),
      content: post.content,
    };
  }
}
