import { Injectable } from '@nestjs/common';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediaService {
  constructor(private readonly prismaService: PrismaService) {}

  async list(query: PaginationQueryDto) {
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await Promise.all([
      this.prismaService.mediaFile.findMany({
        skip,
        take: query.pageSize,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.mediaFile.count(),
    ]);

    return {
      items,
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async create(dto: CreateMediaDto) {
    return this.prismaService.mediaFile.create({
      data: dto,
    });
  }
}
