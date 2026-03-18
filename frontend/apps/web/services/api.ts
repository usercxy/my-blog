import { cloneSiteSettings, formatMonthLabel } from '@blog/shared-utils'
import type {
  Article,
  ArticleStatus,
  Category,
  ExperienceItem,
  Project,
  SiteSettings,
  SocialLink,
  Tag,
} from '@blog/shared-types'

interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
}

interface BackendCategory {
  id: string
  name: string
  slug: string
  description?: string | null
  postCount?: number
}

interface BackendTag {
  id: string
  name: string
  slug: string
  postCount?: number
}

interface BackendPostSummary {
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
}

interface BackendPostDetail extends BackendPostSummary {
  content?: {
    markdownContent?: string | null
  } | null
}

interface BackendProject {
  id: string
  title: string
  slug: string
  summary?: string | null
  content?: string | null
  previewUrl?: string | null
  repoUrl?: string | null
  sortOrder?: number
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
  title?: string | null
  summary?: string | null
  content?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
}

interface BackendArchiveGroup {
  year: number
  month: number
  posts: BackendPostSummary[]
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type ArticleCardItem = Article & {
  category?: Category
  tags: Tag[]
}

export interface SearchResultItem {
  id: string
  title: string
  slug: string
  summary: string
  snippet: string
  publishedAt: string
  categories: Category[]
  tags: Tag[]
}

export interface AboutPageData {
  title: string
  summary: string
  content: string
  seoTitle: string
  seoDescription: string
}

const DEFAULT_API_BASE_URL = 'http://localhost:8000/api'
const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80'

const normalizeApiBaseUrl = (value: string) => value.replace(/\/+$/, '')

const getApiBaseUrl = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBaseUrl || DEFAULT_API_BASE_URL

  return normalizeApiBaseUrl(baseUrl)
}

const request = async <T>(path: string, query?: Record<string, string | number | undefined>) => {
  const baseUrl = getApiBaseUrl()

  return $fetch<ApiEnvelope<T>>(`${baseUrl}${path}`, {
    query,
  }).then((response) => response.data)
}

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

const mapCategory = (category?: BackendCategory | null): Category | undefined => {
  if (!category) {
    return undefined
  }

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? '',
  }
}

const mapTag = (tag: BackendTag): Tag => ({
  id: tag.id,
  name: tag.name,
  slug: tag.slug,
})

const splitMarkdownToSections = (markdown?: string | null) => {
  const paragraphs = (markdown ?? '')
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean)

  return [
    {
      id: 'main-body',
      title: '正文内容',
      paragraphs: paragraphs.length > 0 ? paragraphs : ['暂无正文内容。'],
    },
  ]
}

const mapPost = (post: BackendPostSummary | BackendPostDetail): ArticleCardItem => {
  const primaryCategory = mapCategory(post.categories?.[0])
  const tags = (post.tags ?? []).map(mapTag)

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    summary: post.summary ?? '',
    cover: post.cover ?? DEFAULT_COVER,
    featured: Boolean(post.isTop),
    sticky: Boolean(post.isTop),
    publishedAt: post.publishedAt ?? post.updatedAt ?? new Date().toISOString(),
    updatedAt: post.updatedAt ?? post.publishedAt ?? new Date().toISOString(),
    readingTime: post.readingTime ?? Math.max(1, Math.ceil((post.wordCount ?? 0) / 300)),
    status: mapArticleStatus(post.status),
    categoryId: primaryCategory?.id ?? '',
    tagIds: tags.map((tag) => tag.id),
    seoTitle: post.seoTitle ?? post.title,
    seoDescription: post.seoDescription ?? post.summary ?? '',
    sections:
      'content' in post
        ? splitMarkdownToSections(post.content?.markdownContent)
        : splitMarkdownToSections(post.summary),
    category: primaryCategory,
    tags,
  }
}

const mapProject = (project: BackendProject, index: number): Project => ({
  id: project.id,
  name: project.title,
  slug: project.slug,
  summary: project.summary ?? '',
  description: project.content ?? project.summary ?? '',
  techStack: [],
  href: project.previewUrl ?? project.repoUrl ?? '',
  featured: index < 2 || (project.sortOrder ?? 999) <= 1,
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

export const mapPublicSiteSettings = (settings: BackendSiteSettings): SiteSettings => {
  const defaults = cloneSiteSettings()

  return {
    ...defaults,
    siteName: settings.siteName?.trim() || defaults.siteName,
    siteSubtitle: settings.siteDescription?.trim() || defaults.siteSubtitle,
    heroTitle: settings.seoTitle?.trim() || settings.siteName?.trim() || defaults.heroTitle,
    heroDescription:
      settings.seoDescription?.trim()
      || settings.siteDescription?.trim()
      || defaults.heroDescription,
    footerText: settings.siteDescription?.trim() || defaults.footerText,
    skills: normalizeSkills(settings.skills, defaults.skills),
    experiences: normalizeExperiences(settings.experiences, defaults.experiences),
    contactEmail:
      settings.contactEmail === null || settings.contactEmail === undefined
        ? defaults.contactEmail
        : settings.contactEmail.trim(),
    socialLinks: normalizeSocialLinks(settings.socialLinks, defaults.socialLinks),
  }
}

export const fetchHomePageData = async () => {
  const data = await request<{
    site: BackendSiteSettings
    categories: BackendCategory[]
    projects: BackendProject[]
    featuredPosts: BackendPostSummary[]
    latestPosts: BackendPostSummary[]
  }>('/public/home')

  return {
    site: mapPublicSiteSettings(data.site),
    categories: data.categories.map((category) => mapCategory(category)).filter(Boolean) as Category[],
    projects: data.projects.map(mapProject),
    featuredPosts: data.featuredPosts.map(mapPost),
    latestPosts: data.latestPosts.map(mapPost),
  }
}

export const fetchPublicPosts = async (query?: {
  keyword?: string
  page?: number
  pageSize?: number
}) => {
  const data = await request<PaginatedResponse<BackendPostSummary>>('/public/posts', query)

  return {
    ...data,
    items: data.items.map(mapPost),
  }
}

export const fetchPublicPostDetail = async (slug: string) => {
  const data = await request<BackendPostDetail>(`/public/posts/${slug}`)
  return mapPost(data)
}

export const fetchPublicCategories = async () => {
  const data = await request<BackendCategory[]>('/public/categories')

  return data.map((category) => mapCategory(category)).filter(Boolean) as Category[]
}

export const fetchCategoryPosts = async (slug: string, pageSize = 100) => {
  const data = await request<PaginatedResponse<BackendPostSummary>>(`/public/categories/${slug}/posts`, {
    pageSize,
  })

  return {
    ...data,
    items: data.items.map(mapPost),
  }
}

export const fetchPublicTags = async () => {
  const data = await request<BackendTag[]>('/public/tags')

  return data.map(mapTag)
}

export const fetchTagPosts = async (slug: string, pageSize = 100) => {
  const data = await request<PaginatedResponse<BackendPostSummary>>(`/public/tags/${slug}/posts`, {
    pageSize,
  })

  return {
    ...data,
    items: data.items.map(mapPost),
  }
}

export const fetchArchiveGroups = async () => {
  const data = await request<BackendArchiveGroup[]>('/public/archive')

  return data.map((group) => ({
    yearMonth: `${group.year}-${String(group.month).padStart(2, '0')}`,
    label: formatMonthLabel(`${group.year}-${String(group.month).padStart(2, '0')}-01`),
    articles: group.posts.map(mapPost),
  }))
}

export const fetchSearchResults = async (keyword: string, pageSize = 20) => {
  const data = await request<PaginatedResponse<{
    id: string
    title: string
    slug: string
    summary?: string | null
    snippet?: string | null
    publishedAt?: string | null
    categories?: BackendCategory[]
    tags?: BackendTag[]
  }>>('/public/search', {
    keyword,
    pageSize,
  })

  return {
    ...data,
    items: data.items.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary ?? '',
      snippet: item.snippet ?? '',
      publishedAt: item.publishedAt ?? '',
      categories: (item.categories ?? [])
        .map((category) => mapCategory(category))
        .filter(Boolean) as Category[],
      tags: (item.tags ?? []).map(mapTag),
    })),
  }
}

export const fetchAboutPage = async (): Promise<AboutPageData> => {
  const data = await request<BackendPage>('/public/about')

  return {
    title: data.title?.trim() || '关于我',
    summary: data.summary?.trim() || '',
    content: data.content?.trim() || '',
    seoTitle: data.seoTitle?.trim() || data.title?.trim() || '关于我',
    seoDescription: data.seoDescription?.trim() || data.summary?.trim() || '',
  }
}

export const fetchPublicProjects = async () => {
  const data = await request<BackendProject[]>('/public/projects')

  return data.map(mapProject)
}

export const fetchProjectDetail = async (slug: string) => {
  const data = await request<BackendProject>(`/public/projects/${slug}`)
  return mapProject(data, 0)
}

export const fetchSiteSettings = async () => {
  const data = await request<BackendSiteSettings>('/public/site')
  return mapPublicSiteSettings(data)
}

export const buildArticleNeighbors = (articles: ArticleCardItem[], slug: string) => {
  const publishedArticles = [...articles].sort(
    (first, second) => new Date(second.publishedAt).getTime() - new Date(first.publishedAt).getTime(),
  )
  const index = publishedArticles.findIndex((article) => article.slug === slug)

  return {
    prev: index >= 0 ? publishedArticles[index + 1] : undefined,
    next: index >= 0 ? publishedArticles[index - 1] : undefined,
  }
}

export const buildRelatedArticles = (articles: ArticleCardItem[], currentArticle: ArticleCardItem, limit = 3) =>
  articles
    .filter((article) => article.id !== currentArticle.id)
    .map((article) => {
      const matchedTags = article.tagIds.filter((tagId) => currentArticle.tagIds.includes(tagId)).length
      const sameCategory = article.categoryId === currentArticle.categoryId ? 1 : 0

      return {
        article,
        score: matchedTags * 2 + sameCategory,
      }
    })
    .sort((first, second) => second.score - first.score)
    .slice(0, limit)
    .map((item) => item.article)

export const summarizeReadingStats = (articles: ArticleCardItem[]) =>
  articles.reduce(
    (summary, article) => {
      summary.total += 1
      summary.minutes += article.readingTime
      return summary
    },
    {
      total: 0,
      minutes: 0,
    },
  )
