import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { SiteService } from './site.service';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';

@ApiTags('admin')
@UseGuards(AdminAuthGuard)
@Controller('admin/site/settings')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get()
  getSettings() {
    return this.siteService.getSettings();
  }

  @Put()
  updateSettings(@Body() dto: UpdateSiteSettingsDto) {
    return this.siteService.updateSettings(dto);
  }
}
