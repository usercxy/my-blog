export interface NavigationItem {
  label: string
  to: string
}

export interface SocialLink {
  label: string
  href: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface ArticleSection {
  id: string
  title: string
  paragraphs: string[]
}

export type ArticleStatus = 'draft' | 'published' | 'hidden'

export interface Article {
  id: string
  title: string
  slug: string
  summary: string
  cover: string
  featured: boolean
  sticky: boolean
  publishedAt: string
  updatedAt: string
  readingTime: number
  status: ArticleStatus
  categoryId: string
  tagIds: string[]
  seoTitle: string
  seoDescription: string
  sections: ArticleSection[]
}

export interface Project {
  id: string
  name: string
  slug: string
  summary: string
  description: string
  techStack: string[]
  href: string
  featured: boolean
}

export interface ExperienceItem {
  period: string
  title: string
  description: string
}

export interface SiteSettings {
  siteName: string
  siteSubtitle: string
  heroTitle: string
  heroDescription: string
  footerText: string
  aboutLead: string
  aboutDescription: string
  skills: string[]
  experiences: ExperienceItem[]
  contactEmail: string
  navigation: NavigationItem[]
  socialLinks: SocialLink[]
}

export interface AdminUser {
  id: string
  name: string
  role: string
  email: string
}

export interface DashboardMetric {
  label: string
  value: string
  hint: string
}

export interface ArchiveGroup {
  yearMonth: string
  label: string
  articles: Article[]
}

export interface ArticleQuery {
  keyword?: string
  categorySlug?: string
  tagSlug?: string
  status?: ArticleStatus | 'all'
}
