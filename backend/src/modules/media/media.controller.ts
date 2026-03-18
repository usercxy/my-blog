import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { CreateMediaDto } from './dto/create-media.dto';
import { MediaService } from './media.service';

@ApiTags('admin')
@UseGuards(AdminAuthGuard)
@Controller('admin/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  list(@Query() query: PaginationQueryDto) {
    return this.mediaService.list(query);
  }

  @Post('upload')
  upload(@Body() dto: CreateMediaDto) {
    return this.mediaService.create(dto);
  }
}
