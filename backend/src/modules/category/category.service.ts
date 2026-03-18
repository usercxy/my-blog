import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { createSlug } from '../../common/utils/slug.util';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoryQueryDto } from './dto/category-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}

  async listAdmin(query: CategoryQueryDto) {
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
      this.prismaService.category.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              postCategories: true,
            },
          },
        },
      }),
      this.prismaService.category.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        postCount: item._count.postCategories,
      })),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async listPublic() {
    const items = await this.prismaService.category.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            postCategories: true,
          },
        },
      },
    });

    return items.map((item) => ({
      ...item,
      postCount: item._count.postCategories,
    }));
  }

  async findBySlug(slug: string) {
    const category = await this.prismaService.category.findUnique({
      where: {
        slug,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug ? createSlug(dto.slug) : createSlug(dto.name);

    await this.ensureSlugAvailable(slug);

    return this.prismaService.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const categoryId = BigInt(id);
    await this.ensureExists(categoryId);

    let slug: string | undefined;
    if (dto.slug || dto.name) {
      const nextSlug = dto.slug ? createSlug(dto.slug) : createSlug(dto.name ?? '');
      await this.ensureSlugAvailable(nextSlug, categoryId);
      slug = nextSlug;
    }

    return this.prismaService.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name: dto.name,
        slug,
        description: dto.description,
      },
    });
  }

  async remove(id: string) {
    const categoryId = BigInt(id);
    const category = await this.ensureExists(categoryId);
    const references = await this.prismaService.postCategory.count({
      where: {
        categoryId,
      },
    });

    if (references > 0) {
      throw new ConflictException('当前分类仍被文章引用，不能删除');
    }

    await this.prismaService.category.delete({
      where: {
        id: categoryId,
      },
    });

    return {
      deletedId: category.id,
    };
  }

  private async ensureExists(id: bigint) {
    const category = await this.prismaService.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  private async ensureSlugAvailable(slug: string, ignoreId?: bigint) {
    const existing = await this.prismaService.category.findUnique({
      where: {
        slug,
      },
    });

    if (existing && existing.id !== ignoreId) {
      throw new ConflictException('Category slug already exists');
    }
  }
}
