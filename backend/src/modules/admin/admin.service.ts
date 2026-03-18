import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  getPing() {
    return {
      status: 'ok',
      area: 'admin',
      message: 'Admin demo endpoint is ready.',
    };
  }
}
