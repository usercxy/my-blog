<script setup lang="ts">
import { useSiteStore } from '~/stores/site'

defineProps<{
  featuredProjectCount: number
  readingStats: {
    total: number
    minutes: number
  }
}>()

const siteStore = useSiteStore()
</script>

<template>
  <section class="hero-banner card">
    <span class="eyebrow">{{ siteStore.siteSubtitle }}</span>
    <h1>{{ siteStore.heroTitle }}</h1>
    <p>
      {{ siteStore.heroDescription }}
    </p>
    <div class="hero-actions">
      <NuxtLink class="button button--primary" to="/articles">
        浏览最新文章
      </NuxtLink>
      <NuxtLink class="button" to="/about">
        了解博主与项目
      </NuxtLink>
    </div>
    <dl class="hero-stats">
      <div class="hero-stats__item">
        <dt>已发布文章</dt>
        <dd>{{ readingStats.total }}</dd>
      </div>
      <div class="hero-stats__item">
        <dt>累计阅读时长</dt>
        <dd>{{ readingStats.minutes }} min</dd>
      </div>
      <div class="hero-stats__item">
        <dt>精选项目</dt>
        <dd>{{ featuredProjectCount }}</dd>
      </div>
    </dl>
  </section>
</template>
