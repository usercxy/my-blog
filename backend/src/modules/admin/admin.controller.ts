import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin/system')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('ping')
  getPing() {
    return this.adminService.getPing();
  }
}
