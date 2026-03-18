import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { StatsService } from './stats.service';

@ApiTags('admin')
@UseGuards(AdminAuthGuard)
@Controller('admin/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.statsService.getDashboard();
  }
}
