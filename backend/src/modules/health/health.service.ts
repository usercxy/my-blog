import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prismaService: PrismaService) {}

  getHealth() {
    return {
      status: 'ok',
      service: process.env.APP_NAME ?? 'personal-blog-api',
      uptime: process.uptime(),
      databaseConfigured: Boolean(process.env.DATABASE_URL),
    };
  }

  async getDatabaseHealth() {
    try {
      await this.prismaService.checkConnection();

      return {
        status: 'ok',
        database: 'postgresql',
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'postgresql',
        message:
          error instanceof Error
            ? error.message
            : 'Database connection failed',
      };
    }
  }
}
