import type {
  AdminUser,
  Article,
  Category,
  Project,
  SiteSettings,
  Tag,
} from '@blog/shared-types'

export const categories: Category[] = [
  {
    id: 'cat-frontend',
    name: '前端工程',
    slug: 'frontend-engineering',
    description: '关注 Vue、工程化、性能优化与可维护性。',
  },
  {
    id: 'cat-product',
    name: '产品思考',
    slug: 'product-thinking',
    description: '记录产品判断、需求拆解与体验设计方法。',
  },
  {
    id: 'cat-career',
    name: '成长记录',
    slug: 'career-notes',
    description: '沉淀学习路径、项目复盘与长期成长经验。',
  },
]

export const tags: Tag[] = [
  { id: 'tag-vue', name: 'Vue 3', slug: 'vue-3' },
  { id: 'tag-nuxt', name: 'Nuxt 3', slug: 'nuxt-3' },
  { id: 'tag-vite', name: 'Vite', slug: 'vite' },
  { id: 'tag-seo', name: 'SEO', slug: 'seo' },
  { id: 'tag-cms', name: 'CMS', slug: 'cms' },
  { id: 'tag-growth', name: '增长', slug: 'growth' },
]

export const articles: Article[] = [
  {
    id: 'post-001',
    title: '用 Nuxt 3 搭建内容优先的个人博客首页',
    slug: 'nuxt3-homepage-architecture',
    summary: '从信息架构、模块拆分到 SSR 体验，梳理博客首页如何在 SEO 和品牌感之间取得平衡。',
    cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    sticky: true,
    publishedAt: '2026-03-10',
    updatedAt: '2026-03-14',
    readingTime: 8,
    status: 'published',
    categoryId: 'cat-frontend',
    tagIds: ['tag-vue', 'tag-nuxt', 'tag-seo'],
    seoTitle: 'Nuxt 3 博客首页架构实践',
    seoDescription: '围绕个人博客首页，拆解 Nuxt 3 下的 SEO、性能和内容布局方案。',
    sections: [
      {
        id: 'goal',
        title: '首页先回答什么问题',
        paragraphs: [
          '首页不是信息堆叠页，而是访客进入站点后的第一层判断依据。它需要在几秒钟内回答“这是谁的站点”“主要写什么”“我接下来该看哪里”。',
          '因此在结构上，我会优先把品牌介绍、最新文章、分类入口和搜索入口放在首屏或首屏附近，让第一次进入的读者能够快速建立上下文。',
        ],
      },
      {
        id: 'rendering',
        title: 'Nuxt 3 为什么适合博客首页',
        paragraphs: [
          '博客首页同时承担 SEO 和首屏展示任务，Nuxt 3 的 SSR 能力能够让搜索引擎在抓取时直接读取到页面主内容。',
          '结合缓存策略，首页既可以保持较快的响应，也能兼顾频繁更新后的可见性。',
        ],
      },
      {
        id: 'layout',
        title: '首页模块建议',
        paragraphs: [
          '我倾向于把首页拆成 Hero、精选文章、最新更新、分类导航和底部说明五大块，这样便于后续做内容运营和布局迭代。',
          '在移动端则应把分类和搜索放到更靠上的位置，减少访客下拉查找入口的成本。',
        ],
      },
    ],
  },
  {
    id: 'post-002',
    title: '博客文章详情页应该如何设计目录与阅读体验',
    slug: 'article-reading-experience-design',
    summary: '围绕长文阅读场景，整理目录、代码块、图片和相关推荐的页面设计建议。',
    cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    sticky: false,
    publishedAt: '2026-03-08',
    updatedAt: '2026-03-11',
    readingTime: 6,
    status: 'published',
    categoryId: 'cat-frontend',
    tagIds: ['tag-vue', 'tag-seo'],
    seoTitle: '博客文章详情页的阅读体验设计',
    seoDescription: '从目录、正文宽度、代码块和相关推荐拆解高可读性的文章详情页。',
    sections: [
      {
        id: 'toc',
        title: '目录是长文的导航系统',
        paragraphs: [
          '目录不只是锦上添花，它本质上帮助读者评估内容结构并快速跳转到自己关心的部分。',
          '桌面端适合侧边悬浮目录，移动端更适合抽屉式目录或顶部快捷入口。',
        ],
      },
      {
        id: 'typography',
        title: '正文排版决定停留时长',
        paragraphs: [
          '长文页面的阅读体验主要由正文宽度、字号、行高和段落间距决定。排版越稳定，读者越能进入内容本身。',
          '代码块和表格则需要为移动端预留横向滚动空间，避免内容被压缩得难以辨认。',
        ],
      },
    ],
  },
  {
    id: 'post-003',
    title: '从 0 到 1 设计一个适合个人博客的内容管理后台',
    slug: 'blog-admin-cms-mvp',
    summary: '如何围绕单人维护场景，做一个轻量但顺手的文章管理后台。',
    cover: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    sticky: false,
    publishedAt: '2026-03-05',
    updatedAt: '2026-03-12',
    readingTime: 7,
    status: 'published',
    categoryId: 'cat-product',
    tagIds: ['tag-cms', 'tag-growth'],
    seoTitle: '个人博客 CMS MVP 设计',
    seoDescription: '针对单人维护的博客场景，设计顺手的后台和内容流转方式。',
    sections: [
      {
        id: 'workflow',
        title: '后台首先服务写作流程',
        paragraphs: [
          '个人博客的后台不是复杂协作系统，它首先应该让“创建、保存、发布、修改”这条链路更短。',
          '如果后台增加了维护成本，写作频率一定会下降，所以 MVP 最重要的是顺手和稳定。',
        ],
      },
      {
        id: 'modules',
        title: 'MVP 后台需要哪些模块',
        paragraphs: [
          '登录、文章管理、分类标签管理和站点设置是我认为最早应该落地的部分。',
          '至于媒体管理、备份导出和数据统计，可以在稳定发文后逐步加入。',
        ],
      },
    ],
  },
  {
    id: 'post-004',
    title: '用分类、标签和归档搭建清晰的博客内容结构',
    slug: 'taxonomy-and-archive-strategy',
    summary: '分类负责结构，标签负责横向连接，归档负责时间感，三者组合能显著提升可发现性。',
    cover: 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    sticky: false,
    publishedAt: '2026-02-27',
    updatedAt: '2026-03-03',
    readingTime: 5,
    status: 'published',
    categoryId: 'cat-product',
    tagIds: ['tag-seo', 'tag-growth'],
    seoTitle: '博客分类标签归档策略',
    seoDescription: '拆解个人博客中分类、标签和归档三种内容组织方式的职责。',
    sections: [
      {
        id: 'roles',
        title: '三种组织方式分别负责什么',
        paragraphs: [
          '分类更接近栏目，是博客长期的信息骨架；标签则是跨分类的主题连接；归档强调时间维度，方便回顾更新节奏。',
          '如果三者职责不清，很容易出现重复建设或信息噪音。',
        ],
      },
    ],
  },
  {
    id: 'post-005',
    title: '个人博客如何把搜索页做得真正有用',
    slug: 'search-experience-for-blog',
    summary: '搜索页不只是输入框和结果列表，还要处理空状态、推荐内容和查找路径。',
    cover: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    sticky: false,
    publishedAt: '2026-02-18',
    updatedAt: '2026-02-21',
    readingTime: 4,
    status: 'published',
    categoryId: 'cat-product',
    tagIds: ['tag-growth', 'tag-seo'],
    seoTitle: '博客搜索页设计建议',
    seoDescription: '围绕搜索路径、空状态和推荐内容，改造更有帮助的博客搜索体验。',
    sections: [
      {
        id: 'intent',
        title: '搜索是高意图场景',
        paragraphs: [
          '用户使用搜索通常意味着他已经带着明确目标而来，因此结果页应该优先展示最相关的信息而不是过多装饰。',
          '当没有结果时，也要给出友好的替代路径，例如热门标签、精选文章和相关推荐。',
        ],
      },
    ],
  },
  {
    id: 'post-006',
    title: '一份适合持续写作的个人成长型博客内容规划',
    slug: 'sustainable-blog-content-plan',
    summary: '从选题结构、栏目设计到长期维护节奏，建立可持续写作的博客体系。',
    cover: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    sticky: false,
    publishedAt: '2026-01-30',
    updatedAt: '2026-02-10',
    readingTime: 9,
    status: 'draft',
    categoryId: 'cat-career',
    tagIds: ['tag-growth'],
    seoTitle: '可持续写作的博客内容规划',
    seoDescription: '围绕长期写作，规划选题、栏目和维护节奏。',
    sections: [
      {
        id: 'planning',
        title: '建立可持续的选题系统',
        paragraphs: [
          '持续写作最怕的不是写得慢，而是每次都从零开始想题目。把选题沉淀为固定栏目，能显著降低开始写的阻力。',
          '当博客具备稳定结构后，访客也会更容易理解你长期在关注什么。',
        ],
      },
    ],
  },
]

export const projects: Project[] = [
  {
    id: 'project-001',
    name: 'Personal Blog Frontend',
    slug: 'personal-blog-frontend',
    summary: '基于 Nuxt 3 与 Vue 3 的个人博客双应用前端方案。',
    description: '聚焦 SEO、响应式阅读体验与可维护的后台管理结构，适合作为个人内容平台的长期基础设施。',
    techStack: ['Nuxt 3', 'Vue 3', 'TypeScript', 'Pinia'],
    href: 'https://example.com/personal-blog',
    featured: true,
  },
  {
    id: 'project-002',
    name: 'Markdown Knowledge Base',
    slug: 'markdown-knowledge-base',
    summary: '围绕 Markdown 写作和知识归档的内容系统实验。',
    description: '探索文章、笔记、项目记录之间的结构化组织方式，并支持搜索与关联阅读。',
    techStack: ['Vue 3', 'Vite', 'Markdown'],
    href: 'https://example.com/knowledge-base',
    featured: true,
  },
  {
    id: 'project-003',
    name: 'Creator Dashboard',
    slug: 'creator-dashboard',
    summary: '为内容创作者设计的轻量后台和数据面板。',
    description: '突出发文流程、分类管理和站点设置，让单人维护更顺手。',
    techStack: ['Vue 3', 'Element Plus', 'Pinia'],
    href: 'https://example.com/dashboard',
    featured: false,
  },
]

export const siteSettings: SiteSettings = {
  siteName: '林间博客',
  siteSubtitle: '写技术、产品与持续成长',
  heroTitle: '把知识沉淀成可以长期生长的个人内容资产',
  heroDescription: '这里记录前端工程、产品思考和个人成长，希望把每一次项目实践都整理成可复用的经验。',
  footerText: 'Lin Blog Demo · Nuxt 3 + Vue 3',
  aboutLead: '你好，我是一个长期写作、持续打磨产品与前端体验的创作者。',
  aboutDescription: '我希望这个博客既是知识库，也是作品集，更是一个能持续更新的个人表达空间。',
  skills: ['Vue 3', 'Nuxt 3', 'TypeScript', 'Node.js', '产品设计', 'SEO'],
  experiences: [
    {
      period: '2024 - 至今',
      title: '独立内容平台建设',
      description: '围绕技术写作、产品复盘和项目展示，搭建个人内容品牌。',
    },
    {
      period: '2021 - 2024',
      title: '前端与体验设计实践',
      description: '负责企业级中后台、增长活动页和内容平台的前端架构与体验优化。',
    },
  ],
  contactEmail: 'hello@example.com',
  navigation: [
    { label: '首页', to: '/' },
    { label: '文章', to: '/articles' },
    { label: '归档', to: '/archive' },
    { label: '项目', to: '/projects' },
    { label: '关于', to: '/about' },
    { label: '搜索', to: '/search' },
  ],
  socialLinks: [
    { label: 'GitHub', href: 'https://github.com/' },
    { label: 'X', href: 'https://x.com/' },
    { label: 'Email', href: 'mailto:hello@example.com' },
  ],
}

export const adminUser: AdminUser = {
  id: 'admin-001',
  name: 'Lin',
  role: 'Owner',
  email: 'hello@example.com',
}
