import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { createSlug } from '../../common/utils/slug.util';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagQueryDto } from './dto/tag-query.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagService {
  constructor(private readonly prismaService: PrismaService) {}

  async listAdmin(query: TagQueryDto) {
    const where = query.keyword
      ? {
          OR: [
            {
              name: {
                contains: query.keyword,
                mode: 'insensitive' as const,
              },
            },
            {
              slug: {
                contains: query.keyword,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await Promise.all([
      this.prismaService.tag.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              postTags: true,
            },
          },
        },
      }),
      this.prismaService.tag.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        postCount: item._count.postTags,
      })),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async listPublic() {
    const items = await this.prismaService.tag.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            postTags: true,
          },
        },
      },
    });

    return items.map((item) => ({
      ...item,
      postCount: item._count.postTags,
    }));
  }

  async findBySlug(slug: string) {
    const tag = await this.prismaService.tag.findUnique({
      where: {
        slug,
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async create(dto: CreateTagDto) {
    const slug = dto.slug ? createSlug(dto.slug) : createSlug(dto.name);
    await this.ensureSlugAvailable(slug);

    return this.prismaService.tag.create({
      data: {
        name: dto.name,
        slug,
      },
    });
  }

  async update(id: string, dto: UpdateTagDto) {
    const tagId = BigInt(id);
    await this.ensureExists(tagId);

    let slug: string | undefined;
    if (dto.slug || dto.name) {
      const nextSlug = dto.slug ? createSlug(dto.slug) : createSlug(dto.name ?? '');
      await this.ensureSlugAvailable(nextSlug, tagId);
      slug = nextSlug;
    }

    return this.prismaService.tag.update({
      where: {
        id: tagId,
      },
      data: {
        name: dto.name,
        slug,
      },
    });
  }

  async remove(id: string) {
    const tagId = BigInt(id);
    const tag = await this.ensureExists(tagId);
    const references = await this.prismaService.postTag.count({
      where: {
        tagId,
      },
    });

    if (references > 0) {
      throw new ConflictException('当前标签仍被文章引用，不能删除');
    }

    await this.prismaService.tag.delete({
      where: {
        id: tagId,
      },
    });

    return {
      deletedId: tag.id,
    };
  }

  private async ensureExists(id: bigint) {
    const tag = await this.prismaService.tag.findUnique({
      where: {
        id,
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  private async ensureSlugAvailable(slug: string, ignoreId?: bigint) {
    const existing = await this.prismaService.tag.findUnique({
      where: {
        slug,
      },
    });

    if (existing && existing.id !== ignoreId) {
      throw new ConflictException('Tag slug already exists');
    }
  }
}
