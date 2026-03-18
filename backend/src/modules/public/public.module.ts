import { Module } from '@nestjs/common';

import { CategoryModule } from '../category/category.module';
import { PageModule } from '../page/page.module';
import { PostModule } from '../post/post.module';
import { ProjectModule } from '../project/project.module';
import { SearchModule } from '../search/search.module';
import { SiteModule } from '../site/site.module';
import { TagModule } from '../tag/tag.module';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

@Module({
  imports: [
    PostModule,
    CategoryModule,
    TagModule,
    PageModule,
    ProjectModule,
    SiteModule,
    SearchModule,
  ],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
