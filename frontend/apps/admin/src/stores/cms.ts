import { defineStore } from 'pinia'
import type {
  Article,
  ArticleStatus,
  Category,
  DashboardMetric,
  ExperienceItem,
  SiteSettings,
  SocialLink,
  Tag,
} from '@blog/shared-types'
import { cloneSiteSettings } from '@blog/shared-utils'
import { apiDelete, apiGet, apiPost, apiPut } from '../services/api'
import { useAuthStore } from './auth'

interface BackendCategory {
  id: string
  name: string
  slug: string
  description?: string | null
}

interface BackendTag {
  id: string
  name: string
  slug: string
}

interface BackendPost {
  id: string
  title: string
  slug: string
  summary?: string | null
  cover?: string | null
  status?: string | null
  publishedAt?: string | null
  updatedAt?: string | null
  isTop?: boolean
  seoTitle?: string | null
  seoDescription?: string | null
  categories?: BackendCategory[]
  tags?: BackendTag[]
  readingTime?: number
  wordCount?: number
  content?: {
    markdownContent?: string | null
  } | null
}

interface BackendSiteSettings {
  siteName?: string | null
  siteDescription?: string | null
  siteUrl?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  skills?: unknown
  experiences?: unknown
  contactEmail?: string | null
  socialLinks?: unknown
}

interface BackendPage {
  summary?: string | null
  content?: string | null
}

interface BackendProject {
  id: string
  title: string
  slug: string
  summary?: string | null
  content?: string | null
  cover?: string | null
  repoUrl?: string | null
  previewUrl?: string | null
  status?: string | null
  sortOrder?: number | null
  createdAt?: string | null
  updatedAt?: string | null
}

interface DashboardStats {
  postCount: number
  categoryCount: number
  tagCount: number
}

export type ProjectStatus = 'draft' | 'published' | 'archived'

export interface EditableArticle extends Omit<Article, 'id' | 'slug' | 'sections'> {
  id?: string
  slug?: string
  bodyText: string
}

export interface AdminProject {
  id: string
  title: string
  slug: string
  summary: string
  content: string
  cover: string
  repoUrl: string
  previewUrl: string
  status: ProjectStatus
  sortOrder: number
  createdAt: string
  updatedAt: string
  featured: boolean
}

export interface EditableProject extends Omit<AdminProject, 'id' | 'createdAt' | 'updatedAt' | 'featured'> {
  id?: string
}

export interface SiteConfigForm {
  siteName: string
  siteDescription: string
  siteUrl: string
  seoTitle: string
  seoDescription: string
  aboutSummary: string
  aboutContent: string
  skillsText: string
  experiencesText: string
  contactEmail: string
  socialLinksText: string
}

interface CmsState {
  articles: Article[]
  recentArticles: Article[]
  projects: AdminProject[]
  categories: Category[]
  tags: Tag[]
  siteSettings: SiteSettings
  siteConfig: SiteConfigForm
  dashboardStats: DashboardStats
}

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80'

const mapCategory = (category: BackendCategory): Category => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  description: category.description ?? '',
})

const mapTag = (tag: BackendTag): Tag => ({
  id: tag.id,
  name: tag.name,
  slug: tag.slug,
})

const mapArticleStatus = (status?: string | null): ArticleStatus => {
  switch (status?.toUpperCase()) {
    case 'PUBLISHED':
      return 'published'
    case 'HIDDEN':
      return 'hidden'
    default:
      return 'draft'
  }
}

const mapProjectStatus = (status?: string | null): ProjectStatus => {
  switch (status?.toUpperCase()) {
    case 'PUBLISHED':
      return 'published'
    case 'ARCHIVED':
      return 'archived'
    default:
      return 'draft'
  }
}

const toApiArticleStatus = (status: ArticleStatus) => {
  switch (status) {
    case 'published':
      return 'PUBLISHED'
    case 'hidden':
      return 'HIDDEN'
    default:
      return 'DRAFT'
  }
}

const toApiProjectStatus = (status: ProjectStatus) => {
  switch (status) {
    case 'published':
      return 'PUBLISHED'
    case 'archived':
      return 'ARCHIVED'
    default:
      return 'DRAFT'
  }
}

const splitMarkdownToSections = (markdown?: string | null) => {
  const paragraphs = (markdown ?? '')
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean)

  return [
    {
      id: 'main-body',
      title: '正文内容',
      paragraphs: paragraphs.length > 0 ? paragraphs : [],
    },
  ]
}

const joinSectionsToMarkdown = (article: Article) =>
  article.sections
    .flatMap((section) => section.paragraphs)
    .join('\n\n')

const mapArticle = (post: BackendPost): Article => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  summary: post.summary ?? '',
  cover: post.cover ?? DEFAULT_COVER,
  featured: Boolean(post.isTop),
  sticky: Boolean(post.isTop),
  publishedAt: post.publishedAt ?? post.updatedAt ?? new Date().toISOString().slice(0, 10),
  updatedAt: post.updatedAt ?? post.publishedAt ?? new Date().toISOString().slice(0, 10),
  readingTime: post.readingTime ?? Math.max(1, Math.ceil((post.wordCount ?? 0) / 300)),
  status: mapArticleStatus(post.status),
  categoryId: post.categories?.[0]?.id ?? '',
  tagIds: (post.tags ?? []).map((tag) => tag.id),
  seoTitle: post.seoTitle ?? post.title,
  seoDescription: post.seoDescription ?? post.summary ?? '',
  sections: splitMarkdownToSections(post.content?.markdownContent ?? post.summary),
})

const mapProject = (project: BackendProject): AdminProject => ({
  id: project.id,
  title: project.title,
  slug: project.slug,
  summary: project.summary ?? '',
  content: project.content ?? '',
  cover: project.cover ?? '',
  repoUrl: project.repoUrl ?? '',
  previewUrl: project.previewUrl ?? '',
  status: mapProjectStatus(project.status),
  sortOrder: project.sortOrder ?? 0,
  createdAt: project.createdAt ?? '',
  updatedAt: project.updatedAt ?? project.createdAt ?? '',
  featured: (project.sortOrder ?? 999) <= 1,
})

const sortProjects = (projects: AdminProject[]) =>
  projects.sort((first, second) => {
    if (first.sortOrder !== second.sortOrder) {
      return first.sortOrder - second.sortOrder
    }

    return new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
  })

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const normalizeSkills = (value: unknown, fallback: string[]) => {
  if (value === null || value === undefined) {
    return [...fallback]
  }

  if (!Array.isArray(value)) {
    return [...fallback]
  }

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
}

const normalizeExperiences = (value: unknown, fallback: ExperienceItem[]) => {
  if (value === null || value === undefined) {
    return fallback.map((item) => ({ ...item }))
  }

  if (!Array.isArray(value)) {
    return fallback.map((item) => ({ ...item }))
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return []
    }

    const period = typeof item.period === 'string' ? item.period.trim() : ''
    const title = typeof item.title === 'string' ? item.title.trim() : ''
    const description = typeof item.description === 'string' ? item.description.trim() : ''

    if (!period && !title && !description) {
      return []
    }

    return [{ period, title, description }]
  })
}

const normalizeSocialLinks = (value: unknown, fallback: SocialLink[]) => {
  if (value === null || value === undefined) {
    return fallback.map((item) => ({ ...item }))
  }

  if (!Array.isArray(value)) {
    return fallback.map((item) => ({ ...item }))
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return []
    }

    const label = typeof item.label === 'string' ? item.label.trim() : ''
    const href = typeof item.href === 'string' ? item.href.trim() : ''

    if (!label || !href) {
      return []
    }

    return [{ label, href }]
  })
}

const formatSkillsText = (skills: string[]) => skills.join('\n')

const formatExperiencesText = (experiences: ExperienceItem[]) =>
  experiences.map((item) => `${item.period} | ${item.title} | ${item.description}`).join('\n')

const formatSocialLinksText = (links: SocialLink[]) =>
  links.map((item) => `${item.label} | ${item.href}`).join('\n')

const splitStructuredLine = (line: string) =>
  line
    .replace(/｜/g, '|')
    .split('|')
    .map((item) => item.trim())

const parseSkillsText = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)

const parseExperiencesText = (value: string): ExperienceItem[] =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const [period = '', title = '', ...rest] = splitStructuredLine(line)
      const description = rest.join(' | ').trim()

      if (!period || !title || !description) {
        return []
      }

      return [{ period, title, description }]
    })

const parseSocialLinksText = (value: string): SocialLink[] =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const [label = '', ...rest] = splitStructuredLine(line)
      const href = rest.join(' | ').trim()

      if (!label || !href) {
        return []
      }

      return [{ label, href }]
    })

const createDefaultSiteConfig = (): SiteConfigForm => ({
  siteName: '',
  siteDescription: '',
  siteUrl: '',
  seoTitle: '',
  seoDescription: '',
  aboutSummary: '',
  aboutContent: '',
  skillsText: '',
  experiencesText: '',
  contactEmail: '',
  socialLinksText: '',
})

const buildViewSiteSettings = (
  siteSettings: BackendSiteSettings,
  aboutPage: BackendPage,
  current: SiteSettings,
): SiteSettings => ({
  ...current,
  siteName: siteSettings.siteName?.trim() || current.siteName,
  siteSubtitle: siteSettings.siteDescription?.trim() || current.siteSubtitle,
  heroTitle: siteSettings.seoTitle?.trim() || siteSettings.siteName?.trim() || current.heroTitle,
  heroDescription:
    siteSettings.seoDescription?.trim()
    || siteSettings.siteDescription?.trim()
    || current.heroDescription,
  footerText: siteSettings.siteDescription?.trim() || current.footerText,
  aboutLead: aboutPage.summary?.trim() || current.aboutLead,
  aboutDescription: aboutPage.content?.trim() || current.aboutDescription,
  skills: normalizeSkills(siteSettings.skills, current.skills),
  experiences: normalizeExperiences(siteSettings.experiences, current.experiences),
  contactEmail:
    siteSettings.contactEmail === null || siteSettings.contactEmail === undefined
      ? current.contactEmail
      : siteSettings.contactEmail.trim(),
  socialLinks: normalizeSocialLinks(siteSettings.socialLinks, current.socialLinks),
})

const requireToken = () => {
  const authStore = useAuthStore()

  if (!authStore.token) {
    throw new Error('登录状态已失效，请重新登录。')
  }

  return authStore.token
}

export const useCmsStore = defineStore('admin-cms', {
  state: (): CmsState => ({
    articles: [],
    recentArticles: [],
    projects: [],
    categories: [],
    tags: [],
    siteSettings: cloneSiteSettings(),
    siteConfig: createDefaultSiteConfig(),
    dashboardStats: {
      postCount: 0,
      categoryCount: 0,
      tagCount: 0,
    },
  }),
  getters: {
    metrics: (state): DashboardMetric[] => [
      {
        label: '文章总数',
        value: String(state.dashboardStats.postCount),
        hint: '后台当前可管理的文章总量',
      },
      {
        label: '分类数量',
        value: String(state.dashboardStats.categoryCount),
        hint: '用于组织内容结构的分类数量',
      },
      {
        label: '标签数量',
        value: String(state.dashboardStats.tagCount),
        hint: '跨文章主题关联使用的标签数量',
      },
    ],
  },
  actions: {
    getArticleById(id: string) {
      return this.articles.find((article) => article.id === id)
    },
    getProjectById(id: string) {
      return this.projects.find((project) => project.id === id)
    },
    getEditableArticle(id?: string): EditableArticle {
      const existing = id ? this.getArticleById(id) : undefined

      if (!existing) {
        return {
          title: '',
          summary: '',
          cover: '',
          featured: false,
          sticky: false,
          publishedAt: new Date().toISOString().slice(0, 10),
          updatedAt: new Date().toISOString().slice(0, 10),
          readingTime: 5,
          status: 'draft',
          categoryId: this.categories[0]?.id ?? '',
          tagIds: [],
          seoTitle: '',
          seoDescription: '',
          bodyText: '',
        }
      }

      return {
        ...existing,
        tagIds: [...existing.tagIds],
        bodyText: joinSectionsToMarkdown(existing),
      }
    },
    getEditableProject(id?: string): EditableProject {
      const existing = id ? this.getProjectById(id) : undefined

      if (!existing) {
        return {
          title: '',
          slug: '',
          summary: '',
          content: '',
          cover: '',
          repoUrl: '',
          previewUrl: '',
          status: 'draft',
          sortOrder: 0,
        }
      }

      return {
        id: existing.id,
        title: existing.title,
        slug: existing.slug,
        summary: existing.summary,
        content: existing.content,
        cover: existing.cover,
        repoUrl: existing.repoUrl,
        previewUrl: existing.previewUrl,
        status: existing.status,
        sortOrder: existing.sortOrder,
      }
    },
    async fetchDashboard() {
      const token = requireToken()
      const [stats, posts] = await Promise.all([
        apiGet<{
          postCount: number
          categoryCount: number
          tagCount: number
        }>('/admin/stats/dashboard', { token }),
        apiGet<{
          items: BackendPost[]
        }>('/admin/posts', {
          token,
          query: {
            page: 1,
            pageSize: 5,
          },
        }),
      ])

      this.dashboardStats = {
        postCount: stats.postCount,
        categoryCount: stats.categoryCount,
        tagCount: stats.tagCount,
      }
      this.recentArticles = posts.items.map(mapArticle)
    },
    async fetchProjects(keyword?: string) {
      const token = requireToken()
      const response = await apiGet<{
        items: BackendProject[]
      }>('/admin/projects', {
        token,
        query: {
          page: 1,
          pageSize: 100,
          keyword,
        },
      })

      this.projects = sortProjects(response.items.map(mapProject))
      return this.projects
    },
    async fetchPosts() {
      const token = requireToken()
      const posts = await apiGet<{
        items: BackendPost[]
      }>('/admin/posts', {
        token,
        query: {
          page: 1,
          pageSize: 100,
        },
      })

      this.articles = posts.items.map(mapArticle)
      return this.articles
    },
    async fetchPostById(id: string) {
      const token = requireToken()
      const post = await apiGet<BackendPost>(`/admin/posts/${id}`, { token })
      const article = mapArticle(post)
      const index = this.articles.findIndex((item) => item.id === article.id)

      if (index >= 0) {
        this.articles.splice(index, 1, article)
      } else {
        this.articles.unshift(article)
      }

      return article
    },
    async fetchProjectById(id: string) {
      const token = requireToken()
      const project = await apiGet<BackendProject>(`/admin/projects/${id}`, { token })
      const mapped = mapProject(project)
      const index = this.projects.findIndex((item) => item.id === mapped.id)

      if (index >= 0) {
        this.projects.splice(index, 1, mapped)
      } else {
        this.projects.unshift(mapped)
      }

      this.projects = sortProjects([...this.projects])
      return mapped
    },
    async fetchCategories() {
      const token = requireToken()
      const response = await apiGet<{ items: BackendCategory[] }>('/admin/categories', {
        token,
        query: {
          page: 1,
          pageSize: 100,
        },
      })

      this.categories = response.items.map(mapCategory)
      return this.categories
    },
    async fetchTags() {
      const token = requireToken()
      const response = await apiGet<{ items: BackendTag[] }>('/admin/tags', {
        token,
        query: {
          page: 1,
          pageSize: 100,
        },
      })

      this.tags = response.items.map(mapTag)
      return this.tags
    },
    async saveArticle(payload: EditableArticle) {
      const token = requireToken()
      const requestBody = {
        title: payload.title.trim(),
        slug: payload.slug?.trim() || undefined,
        summary: payload.summary.trim() || undefined,
        cover: payload.cover.trim() || undefined,
        status: toApiArticleStatus(payload.status),
        markdownContent: payload.bodyText.trim(),
        categoryIds: payload.categoryId ? [payload.categoryId] : [],
        tagIds: payload.tagIds,
        isTop: payload.featured || payload.sticky,
        seoTitle: payload.seoTitle.trim() || undefined,
        seoDescription: payload.seoDescription.trim() || undefined,
      }

      const saved = payload.id
        ? await apiPut<BackendPost>(`/admin/posts/${payload.id}`, requestBody, { token })
        : await apiPost<BackendPost>('/admin/posts', requestBody, { token })

      const article = mapArticle(saved)
      const existingIndex = this.articles.findIndex((item) => item.id === article.id)

      if (existingIndex >= 0) {
        this.articles.splice(existingIndex, 1, article)
      } else {
        this.articles.unshift(article)
      }

      return article
    },
    async deleteArticle(id: string) {
      const token = requireToken()
      await apiDelete<{ deletedId: string }>(`/admin/posts/${id}`, { token })
      this.articles = this.articles.filter((article) => article.id !== id)
      this.recentArticles = this.recentArticles.filter((article) => article.id !== id)
    },
    async saveProject(payload: EditableProject) {
      const token = requireToken()
      const requestBody = {
        title: payload.title.trim(),
        slug: payload.slug.trim() || undefined,
        summary: payload.summary.trim() || undefined,
        content: payload.content.trim() || undefined,
        cover: payload.cover.trim() || undefined,
        repoUrl: payload.repoUrl.trim() || undefined,
        previewUrl: payload.previewUrl.trim() || undefined,
        status: toApiProjectStatus(payload.status),
        sortOrder: Number.isFinite(payload.sortOrder) ? payload.sortOrder : 0,
      }

      const saved = payload.id
        ? await apiPut<BackendProject>(`/admin/projects/${payload.id}`, requestBody, { token })
        : await apiPost<BackendProject>('/admin/projects', requestBody, { token })

      const project = mapProject(saved)
      const existingIndex = this.projects.findIndex((item) => item.id === project.id)

      if (existingIndex >= 0) {
        this.projects.splice(existingIndex, 1, project)
      } else {
        this.projects.unshift(project)
      }

      this.projects = sortProjects([...this.projects])
      return project
    },
    async deleteProject(id: string) {
      const token = requireToken()
      await apiDelete<{ deletedId: string }>(`/admin/projects/${id}`, { token })
      this.projects = this.projects.filter((project) => project.id !== id)
    },
    async deleteCategory(id: string) {
      const token = requireToken()
      await apiDelete<{ deletedId: string }>(`/admin/categories/${id}`, { token })
      this.categories = this.categories.filter((category) => category.id !== id)
    },
    async deleteTag(id: string) {
      const token = requireToken()
      await apiDelete<{ deletedId: string }>(`/admin/tags/${id}`, { token })
      this.tags = this.tags.filter((tag) => tag.id !== id)
    },
    async fetchSiteSettings() {
      const token = requireToken()
      const [siteSettings, aboutPage] = await Promise.all([
        apiGet<BackendSiteSettings>('/admin/site/settings', { token }),
        apiGet<BackendPage>('/admin/pages/about', { token }),
      ])

      this.siteSettings = buildViewSiteSettings(siteSettings, aboutPage, this.siteSettings)
      this.siteConfig = {
        siteName: siteSettings.siteName ?? '',
        siteDescription: siteSettings.siteDescription ?? '',
        siteUrl: siteSettings.siteUrl ?? '',
        seoTitle: siteSettings.seoTitle ?? '',
        seoDescription: siteSettings.seoDescription ?? '',
        aboutSummary: aboutPage.summary ?? '',
        aboutContent: aboutPage.content ?? '',
        skillsText: formatSkillsText(this.siteSettings.skills),
        experiencesText: formatExperiencesText(this.siteSettings.experiences),
        contactEmail: this.siteSettings.contactEmail,
        socialLinksText: formatSocialLinksText(this.siteSettings.socialLinks),
      }

      return this.siteConfig
    },
    async saveSiteSettings(payload: SiteConfigForm) {
      const token = requireToken()
      const siteSettings = await apiPut<BackendSiteSettings>(
        '/admin/site/settings',
        {
          siteName: payload.siteName.trim() || undefined,
          siteDescription: payload.siteDescription.trim() || undefined,
          siteUrl: payload.siteUrl.trim() || undefined,
          seoTitle: payload.seoTitle.trim() || undefined,
          seoDescription: payload.seoDescription.trim() || undefined,
          skills: parseSkillsText(payload.skillsText),
          experiences: parseExperiencesText(payload.experiencesText),
          contactEmail: payload.contactEmail.trim(),
          socialLinks: parseSocialLinksText(payload.socialLinksText),
        },
        { token },
      )

      const aboutPage = await apiPut<BackendPage>(
        '/admin/pages/about',
        {
          title: '关于我',
          summary: payload.aboutSummary.trim() || undefined,
          content: payload.aboutContent.trim() || undefined,
          status: 'PUBLISHED',
          seoTitle: payload.seoTitle.trim() || payload.siteName.trim() || '关于我',
          seoDescription: payload.aboutSummary.trim() || payload.siteDescription.trim() || undefined,
        },
        { token },
      )

      this.siteConfig = { ...payload }
      this.siteSettings = buildViewSiteSettings(siteSettings, aboutPage, this.siteSettings)

      return this.siteSettings
    },
    async addCategory(name: string, description: string) {
      const token = requireToken()
      const created = await apiPost<BackendCategory>(
        '/admin/categories',
        {
          name: name.trim(),
          description: description.trim() || undefined,
        },
        { token },
      )

      this.categories.unshift(mapCategory(created))
    },
    async updateCategory(payload: { id: string; name: string; description: string }) {
      const token = requireToken()
      const updated = await apiPut<BackendCategory>(
        `/admin/categories/${payload.id}`,
        {
          name: payload.name.trim(),
          description: payload.description.trim() || undefined,
        },
        { token },
      )

      const category = mapCategory(updated)
      const index = this.categories.findIndex((item) => item.id === category.id)

      if (index >= 0) {
        this.categories.splice(index, 1, category)
      } else {
        this.categories.unshift(category)
      }

      return category
    },
    async addTag(name: string) {
      const token = requireToken()
      const created = await apiPost<BackendTag>(
        '/admin/tags',
        {
          name: name.trim(),
        },
        { token },
      )

      this.tags.unshift(mapTag(created))
    },
  },
})
