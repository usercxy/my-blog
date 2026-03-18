import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagQueryDto } from './dto/tag-query.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagService } from './tag.service';

@ApiTags('admin')
@UseGuards(AdminAuthGuard)
@Controller('admin/tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  list(@Query() query: TagQueryDto) {
    return this.tagService.listAdmin(query);
  }

  @Post()
  create(@Body() dto: CreateTagDto) {
    return this.tagService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.tagService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagService.remove(id);
  }
}
