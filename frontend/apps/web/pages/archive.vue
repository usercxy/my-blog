<script setup lang="ts">
import { fetchArchiveGroups } from '~/services/api'

const { data: archiveGroups } = await useAsyncData('archive-groups', fetchArchiveGroups)

useSeoMeta({
  title: '归档',
  description: '按年月聚合浏览历史文章。',
})
</script>

<template>
  <div class="page">
    <div class="container page-stack">
      <section class="card">
        <h1>归档页</h1>
        <p>按月份聚合历史文章，帮助访客按时间线浏览内容。</p>
      </section>

      <section class="archive-list">
        <article
          v-for="group in archiveGroups ?? []"
          :key="group.yearMonth"
          class="card archive-card"
        >
          <h2>{{ group.label }}</h2>
          <div class="archive-card__items">
            <NuxtLink
              v-for="article in group.articles"
              :key="article.id"
              :to="`/articles/${article.slug}`"
              class="archive-card__link"
            >
              <span>{{ article.title }}</span>
              <small>{{ article.publishedAt }}</small>
            </NuxtLink>
          </div>
        </article>
      </section>
    </div>
  </div>
</template>
