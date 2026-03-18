import type { Article, Project } from '@blog/shared-types'
import {
  articles,
  categories,
  enrichArticle,
  getCategoryBySlug,
  getFeaturedArticles,
  getFeaturedProjects,
  getPrevNextArticles,
  getProjectBySlug,
  getPublishedArticles,
  getRelatedArticles,
  getTagBySlug,
  groupArticlesByMonth,
  projects,
  searchArticles,
  tags,
} from '@blog/shared-utils'

export const useContentStore = defineStore('content', {
  state: () => ({
    articles,
    categories,
    tags,
    projects,
  }),
  getters: {
    publishedArticles: () => getPublishedArticles().map(enrichArticle),
    featuredArticles: () => getFeaturedArticles().map(enrichArticle),
    featuredProjects: () => getFeaturedProjects(),
    archiveGroups: () => groupArticlesByMonth(getPublishedArticles()),
  },
  actions: {
    getArticle(slug: string) {
      const article = getPublishedArticles().find((item) => item.slug === slug)
      return article ? enrichArticle(article) : undefined
    },
    getArticleNeighbors(slug: string) {
      const { prev, next } = getPrevNextArticles(slug)
      return {
        prev: prev ? enrichArticle(prev) : undefined,
        next: next ? enrichArticle(next) : undefined,
      }
    },
    getRelated(slug: string) {
      const article = getPublishedArticles().find((item) => item.slug === slug)
      if (!article) {
        return []
      }

      return getRelatedArticles(article).map(enrichArticle)
    },
    getArticlesByCategory(slug: string) {
      const category = getCategoryBySlug(slug)
      if (!category) {
        return []
      }

      return getPublishedArticles()
        .filter((article) => article.categoryId === category.id)
        .map(enrichArticle)
    },
    getArticlesByTag(slug: string) {
      const tag = getTagBySlug(slug)
      if (!tag) {
        return []
      }

      return getPublishedArticles()
        .filter((article) => article.tagIds.includes(tag.id))
        .map(enrichArticle)
    },
    search(keyword: string) {
      return searchArticles(keyword).map(enrichArticle)
    },
    getProject(slug: string): Project | undefined {
      return getProjectBySlug(slug)
    },
    getHomepageFeed() {
      return {
        latest: this.publishedArticles.slice(0, 4),
        featured: this.featuredArticles.slice(0, 3),
      }
    },
    getArticleSections(slug: string) {
      const article = this.getArticle(slug)
      return article?.sections ?? []
    },
    getReadingStats() {
      return this.publishedArticles.reduce(
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
    },
    getFeaturedProjectCards() {
      return this.featuredProjects.slice(0, 2)
    },
    toEditableArticle(article: Article) {
      return {
        ...article,
        tagIds: [...article.tagIds],
        sections: article.sections.map((section) => ({
          ...section,
          paragraphs: [...section.paragraphs],
        })),
      }
    },
  },
})
