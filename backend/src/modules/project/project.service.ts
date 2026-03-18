import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';

import { createSlug } from '../../common/utils/slug.util';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prismaService: PrismaService) {}

  async listAdmin(query: ProjectQueryDto) {
    const where = query.keyword
      ? {
          OR: [
            {
              title: {
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
      this.prismaService.project.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
      }),
      this.prismaService.project.count({ where }),
    ]);

    return {
      items,
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async listPublic() {
    return this.prismaService.project.findMany({
      where: {
        status: ProjectStatus.PUBLISHED,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getPublicBySlug(slug: string) {
    const project = await this.prismaService.project.findFirst({
      where: {
        slug,
        status: ProjectStatus.PUBLISHED,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async getAdminDetail(id: string) {
    return this.findProjectById(BigInt(id));
  }

  async create(dto: CreateProjectDto) {
    const slug = dto.slug ? createSlug(dto.slug) : createSlug(dto.title);
    await this.ensureSlugAvailable(slug);

    return this.prismaService.project.create({
      data: {
        title: dto.title,
        slug,
        summary: dto.summary,
        content: dto.content,
        cover: dto.cover,
        repoUrl: dto.repoUrl,
        previewUrl: dto.previewUrl,
        status: dto.status ?? ProjectStatus.DRAFT,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    const projectId = BigInt(id);
    await this.findProjectById(projectId);

    if (dto.slug || dto.title) {
      const nextSlug = dto.slug ? createSlug(dto.slug) : createSlug(dto.title ?? '');
      await this.ensureSlugAvailable(nextSlug, projectId);
    }

    return this.prismaService.project.update({
      where: {
        id: projectId,
      },
      data: {
        title: dto.title,
        slug: dto.slug
          ? createSlug(dto.slug)
          : dto.title
            ? createSlug(dto.title)
            : undefined,
        summary: dto.summary,
        content: dto.content,
        cover: dto.cover,
        repoUrl: dto.repoUrl,
        previewUrl: dto.previewUrl,
        status: dto.status,
        sortOrder: dto.sortOrder,
      },
    });
  }

  async remove(id: string) {
    const projectId = BigInt(id);
    await this.findProjectById(projectId);

    await this.prismaService.project.delete({
      where: {
        id: projectId,
      },
    });

    return {
      deletedId: projectId,
    };
  }

  private async findProjectById(id: bigint) {
    const project = await this.prismaService.project.findUnique({
      where: {
        id,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  private async ensureSlugAvailable(slug: string, ignoreId?: bigint) {
    const project = await this.prismaService.project.findUnique({
      where: {
        slug,
      },
    });

    if (project && project.id !== ignoreId) {
      throw new ConflictException('Project slug already exists');
    }
  }
}
