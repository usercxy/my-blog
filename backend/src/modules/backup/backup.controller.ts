import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { BackupService } from './backup.service';

@ApiTags('admin')
@UseGuards(AdminAuthGuard)
@Controller('admin/backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post('export')
  exportData() {
    return this.backupService.exportData();
  }
}
