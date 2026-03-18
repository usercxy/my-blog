import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageService } from './page.service';

@ApiTags('admin')
@UseGuards(AdminAuthGuard)
@Controller('admin/pages')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get(':key')
  getPage(@Param('key') key: string) {
    return this.pageService.getAdminPage(key);
  }

  @Put(':key')
  updatePage(@Param('key') key: string, @Body() dto: UpdatePageDto) {
    return this.pageService.updatePage(key, dto);
  }
}
