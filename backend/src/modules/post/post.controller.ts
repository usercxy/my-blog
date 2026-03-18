import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { AdminPostQueryDto } from './dto/admin-post-query.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UpdatePostStatusDto } from './dto/update-post-status.dto';
import { PostService } from './post.service';

@ApiTags('admin')
@UseGuards(AdminAuthGuard)
@Controller('admin/posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  list(@Query() query: AdminPostQueryDto) {
    return this.postService.listAdmin(query);
  }

  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.postService.getAdminDetail(id);
  }

  @Post()
  create(@Body() dto: CreatePostDto, @CurrentUser() user: AuthUser) {
    return this.postService.create(dto, user.id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdatePostStatusDto) {
    return this.postService.updateStatus(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
