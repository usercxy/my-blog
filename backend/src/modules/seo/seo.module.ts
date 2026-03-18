import { Module } from '@nestjs/common';

import { SiteModule } from '../site/site.module';
import { SeoController } from './seo.controller';

@Module({
  imports: [SiteModule],
  controllers: [SeoController],
})
export class SeoModule {}
