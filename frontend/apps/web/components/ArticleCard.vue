<script setup lang="ts">
import type { Article, Category, Tag } from '@blog/shared-types'

defineProps<{
  article: Article & {
    category?: Category
    tags: Tag[]
  }
}>()
</script>

<template>
  <article class="card article-card">
    <img
      :src="article.cover"
      :alt="article.title"
      class="article-card__cover"
    >
    <div class="article-card__body">
      <span
        v-if="article.sticky"
        class="eyebrow"
      >
        精选推荐
      </span>
      <h3>{{ article.title }}</h3>
      <p>{{ article.summary }}</p>
      <ArticleMeta
        :published-at="article.publishedAt"
        :updated-at="article.updatedAt"
        :reading-time="article.readingTime"
        :category="article.category"
        :tags="article.tags"
      />
      <NuxtLink
        :to="`/articles/${article.slug}`"
        class="text-link"
      >
        阅读全文
      </NuxtLink>
    </div>
  </article>
</template>
