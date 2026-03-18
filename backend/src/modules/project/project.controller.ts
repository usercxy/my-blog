import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectService } from './project.service';

@ApiTags('admin')
@UseGuards(AdminAuthGuard)
@Controller('admin/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  list(@Query() query: ProjectQueryDto) {
    return this.projectService.listAdmin(query);
  }

  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.projectService.getAdminDetail(id);
  }

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }
}
