import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CategoryService } from '../category/category.service';
import { PageService } from '../page/page.service';
import { PostService } from '../post/post.service';
import { PublicPostQueryDto } from '../post/dto/public-post-query.dto';
import { ProjectService } from '../project/project.service';
import { SearchQueryDto } from '../search/dto/search-query.dto';
import { SearchService } from '../search/search.service';
import { SiteService } from '../site/site.service';
import { TagService } from '../tag/tag.service';
import { PublicService } from './public.service';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(
    private readonly publicService: PublicService,
    private readonly postService: PostService,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    private readonly pageService: PageService,
    private readonly projectService: ProjectService,
    private readonly siteService: SiteService,
    private readonly searchService: SearchService,
  ) {}

  @Get('home')
  getHome() {
    return this.publicService.getHome();
  }

  @Get('posts')
  listPosts(@Query() query: PublicPostQueryDto) {
    return this.postService.listPublic(query);
  }

  @Get('posts/:slug')
  getPostDetail(@Param('slug') slug: string) {
    return this.postService.getPublicBySlug(slug);
  }

  @Get('categories')
  listCategories() {
    return this.categoryService.listPublic();
  }

  @Get('categories/:slug/posts')
  async listCategoryPosts(@Param('slug') slug: string, @Query() query: PublicPostQueryDto) {
    const category = await this.categoryService.findBySlug(slug);
    return this.postService.listPublic({
      ...query,
      categoryId: category.id.toString(),
    });
  }

  @Get('tags')
  listTags() {
    return this.tagService.listPublic();
  }

  @Get('tags/:slug/posts')
  async listTagPosts(@Param('slug') slug: string, @Query() query: PublicPostQueryDto) {
    const tag = await this.tagService.findBySlug(slug);
    return this.postService.listPublic({
      ...query,
      tagId: tag.id.toString(),
    });
  }

  @Get('archive')
  getArchive() {
    return this.postService.listArchive();
  }

  @Get('search')
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query);
  }

  @Get('about')
  getAbout() {
    return this.pageService.getPublicPage('about');
  }

  @Get('projects')
  listProjects() {
    return this.projectService.listPublic();
  }

  @Get('projects/:slug')
  getProjectDetail(@Param('slug') slug: string) {
    return this.projectService.getPublicBySlug(slug);
  }

  @Get('site')
  getSiteSettings() {
    return this.siteService.getSettings();
  }
}
