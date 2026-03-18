import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PageController } from './page.controller';
import { PageService } from './page.service';

@Module({
  imports: [AuthModule],
  controllers: [PageController],
  providers: [PageService],
  exports: [PageService],
})
export class PageModule {}
