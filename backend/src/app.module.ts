import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { validateEnv } from './config/env.validation';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { BackupModule } from './modules/backup/backup.module';
import { CategoryModule } from './modules/category/category.module';
import { HealthModule } from './modules/health/health.module';
import { MediaModule } from './modules/media/media.module';
import { PageModule } from './modules/page/page.module';
import { PostModule } from './modules/post/post.module';
import { ProjectModule } from './modules/project/project.module';
import { PublicModule } from './modules/public/public.module';
import { SearchModule } from './modules/search/search.module';
import { SeoModule } from './modules/seo/seo.module';
import { SiteModule } from './modules/site/site.module';
import { StatsModule } from './modules/stats/stats.module';
import { TagModule } from './modules/tag/tag.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnv,
    }),
    PrismaModule,
    HealthModule,
    PublicModule,
    AdminModule,
    AuthModule,
    UserModule,
    PostModule,
    CategoryModule,
    TagModule,
    SearchModule,
    PageModule,
    ProjectModule,
    SiteModule,
    MediaModule,
    StatsModule,
    BackupModule,
    SeoModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
