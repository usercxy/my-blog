import { Injectable } from '@nestjs/common';

import { CategoryService } from '../category/category.service';
import { PostService } from '../post/post.service';
import { ProjectService } from '../project/project.service';
import { SiteService } from '../site/site.service';

@Injectable()
export class PublicService {
  constructor(
    private readonly postService: PostService,
    private readonly categoryService: CategoryService,
    private readonly projectService: ProjectService,
    private readonly siteService: SiteService,
  ) {}

  async getHome() {
    const [postData, categories, projects, site] = await Promise.all([
      this.postService.listForHome(),
      this.categoryService.listPublic(),
      this.projectService.listPublic(),
      this.siteService.getSettings(),
    ]);

    return {
      site,
      categories,
      projects,
      ...postData,
    };
  }
}
