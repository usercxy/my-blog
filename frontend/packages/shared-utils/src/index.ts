import type {
  ArchiveGroup,
  Article,
  ArticleQuery,
  Category,
  DashboardMetric,
  Project,
  Tag,
} from '@blog/shared-types'
import {
  adminUser,
  articles,
  categories,
  projects,
  siteSettings,
  tags,
} from './mock-data'

export {
  adminUser,
  articles,
  categories,
  projects,
  siteSettings,
  tags,
}

export const formatDateLabel = (date: Date | string) =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))

export const formatMonthLabel = (date: Date | string) =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
  }).format(new Date(date))

export const getCategoryById = (categoryId: string) =>
  categories.find((category) => category.id === categoryId)

export const getCategoryBySlug = (slug: string) =>
  categories.find((category) => category.slug === slug)

export const getTagById = (tagId: string) =>
  tags.find((tag) => tag.id === tagId)

export const getTagBySlug = (slug: string) =>
  tags.find((tag) => tag.slug === slug)

export const getArticleBySlug = (slug: string) =>
  articles.find((article) => article.slug === slug)

export const getProjectBySlug = (slug: string) =>
  projects.find((project) => project.slug === slug)

export const getPublishedArticles = () =>
  articles
    .filter((article) => article.status === 'published')
    .sort(
      (first, second) =>
        new Date(second.publishedAt).getTime() - new Date(first.publishedAt).getTime(),
    )

export const getFeaturedArticles = () =>
  getPublishedArticles().filter((article) => article.featured || article.sticky)

export const getArticlesByCategory = (slug: string) => {
  const category = getCategoryBySlug(slug)
  if (!category) {
    return []
  }

  return getPublishedArticles().filter((article) => article.categoryId === category.id)
}

export const getArticlesByTag = (slug: string) => {
  const tag = getTagBySlug(slug)
  if (!tag) {
    return []
  }

  return getPublishedArticles().filter((article) => article.tagIds.includes(tag.id))
}

export const searchArticles = (keyword: string) => {
  const normalizedKeyword = keyword.trim().toLowerCase()

  if (!normalizedKeyword) {
    return []
  }

  return getPublishedArticles().filter((article) => {
    const category = getCategoryById(article.categoryId)
    const tagNames = article.tagIds
      .map((tagId) => getTagById(tagId)?.name ?? '')
      .join(' ')

    const haystack = [
      article.title,
      article.summary,
      article.seoDescription,
      category?.name ?? '',
      tagNames,
      article.sections.map((section) => `${section.title} ${section.paragraphs.join(' ')}`).join(' '),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedKeyword)
  })
}

export const filterArticles = ({ keyword, categorySlug, tagSlug, status = 'published' }: ArticleQuery) => {
  let scopedArticles = status === 'all'
    ? [...articles]
    : articles.filter((article) => article.status === status)

  if (categorySlug) {
    const category = getCategoryBySlug(categorySlug)
    scopedArticles = category
      ? scopedArticles.filter((article) => article.categoryId === category.id)
      : []
  }

  if (tagSlug) {
    const tag = getTagBySlug(tagSlug)
    scopedArticles = tag
      ? scopedArticles.filter((article) => article.tagIds.includes(tag.id))
      : []
  }

  if (keyword?.trim()) {
    const normalizedKeyword = keyword.trim().toLowerCase()
    scopedArticles = scopedArticles.filter((article) =>
      `${article.title} ${article.summary}`.toLowerCase().includes(normalizedKeyword),
    )
  }

  return scopedArticles.sort(
    (first, second) =>
      new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime(),
  )
}

export const groupArticlesByMonth = (items: Article[]): ArchiveGroup[] => {
  const archiveMap = new Map<string, Article[]>()

  items.forEach((article) => {
    const yearMonth = article.publishedAt.slice(0, 7)
    archiveMap.set(yearMonth, [...(archiveMap.get(yearMonth) ?? []), article])
  })

  return [...archiveMap.entries()]
    .sort(([first], [second]) => second.localeCompare(first))
    .map(([yearMonth, groupedArticles]) => ({
      yearMonth,
      label: formatMonthLabel(`${yearMonth}-01`),
      articles: groupedArticles.sort(
        (first, second) =>
          new Date(second.publishedAt).getTime() - new Date(first.publishedAt).getTime(),
      ),
    }))
}

export const getRelatedArticles = (article: Article, limit = 3) =>
  getPublishedArticles()
    .filter((candidate) => candidate.id !== article.id)
    .map((candidate) => {
      const matchedTags = candidate.tagIds.filter((tagId) => article.tagIds.includes(tagId)).length
      const sameCategory = candidate.categoryId === article.categoryId ? 1 : 0

      return {
        article: candidate,
        score: matchedTags * 2 + sameCategory,
      }
    })
    .sort((first, second) => second.score - first.score)
    .slice(0, limit)
    .map((item) => item.article)

export const getPrevNextArticles = (slug: string) => {
  const list = getPublishedArticles()
  const index = list.findIndex((article) => article.slug === slug)

  if (index === -1) {
    return {
      prev: undefined,
      next: undefined,
    }
  }

  return {
    prev: list[index + 1],
    next: list[index - 1],
  }
}

export const summarizeDashboard = (): DashboardMetric[] => {
  const publishedArticles = articles.filter((article) => article.status === 'published')
  const featuredProjects = projects.filter((project) => project.featured)

  return [
    {
      label: '已发布文章',
      value: String(publishedArticles.length),
      hint: '当前对访客可见的内容总数',
    },
    {
      label: '分类数量',
      value: String(categories.length),
      hint: '用于长期组织内容结构',
    },
    {
      label: '精选项目',
      value: String(featuredProjects.length),
      hint: '首页和项目页重点展示内容',
    },
  ]
}

export const enrichArticle = (article: Article) => ({
  ...article,
  category: getCategoryById(article.categoryId) as Category,
  tags: article.tagIds
    .map((tagId) => getTagById(tagId))
    .filter(Boolean) as Tag[],
})

export const getFeaturedProjects = () =>
  projects.filter((project) => project.featured)

export const buildArticleExcerpt = (article: Article) =>
  article.sections
    .flatMap((section) => section.paragraphs)
    .join(' ')
    .slice(0, 140)

export const cloneArticles = () =>
  articles.map((article) => ({
    ...article,
    tagIds: [...article.tagIds],
    sections: article.sections.map((section) => ({
      ...section,
      paragraphs: [...section.paragraphs],
    })),
  }))

export const cloneProjects = (): Project[] =>
  projects.map((project) => ({
    ...project,
    techStack: [...project.techStack],
  }))

export const cloneSiteSettings = () => ({
  ...siteSettings,
  navigation: siteSettings.navigation.map((item) => ({ ...item })),
  socialLinks: siteSettings.socialLinks.map((item) => ({ ...item })),
  skills: [...siteSettings.skills],
  experiences: siteSettings.experiences.map((item) => ({ ...item })),
})
