import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma client disconnected');
  }

  async checkConnection() {
    await this.$queryRaw`SELECT 1`;
    return true;
  }
}
