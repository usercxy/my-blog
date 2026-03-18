<script setup lang="ts">
import { fetchHomePageData, fetchPublicPosts, summarizeReadingStats } from '~/services/api'

const [{ data: homeData }, { data: allPostsData }] = await Promise.all([
  useAsyncData('home-page', fetchHomePageData),
  useAsyncData('home-page-posts', () => fetchPublicPosts({ pageSize: 100 })),
])

const featured = computed(() => homeData.value?.featuredPosts ?? [])
const latest = computed(() => homeData.value?.latestPosts ?? [])
const categories = computed(() => homeData.value?.categories ?? [])
const featuredProjects = computed(() =>
  (homeData.value?.projects ?? []).filter((project) => project.featured).slice(0, 2),
)
const readingStats = computed(() => summarizeReadingStats(allPostsData.value?.items ?? []))

useSeoMeta({
  title: '首页',
  description: '展示博客定位、精选文章、最新内容和项目入口。',
})
</script>

<template>
  <div class="page">
    <div class="container page-stack">
      <HeroBanner
        :featured-project-count="featuredProjects.length"
        :reading-stats="readingStats"
      />

      <section class="section">
        <div class="section__heading">
          <h2>精选文章</h2>
          <p>优先呈现对博客定位最关键的内容，帮助新访客快速理解站点主题。</p>
        </div>

        <div class="grid cards-grid">
          <ArticleCard
            v-for="article in featured"
            :key="article.id"
            :article="article"
          />
        </div>
      </section>

      <section class="section">
        <div class="section__heading">
          <h2>最新更新</h2>
          <p>按发布时间倒序展示，模拟首页最新文章区域。</p>
        </div>

        <div class="grid cards-grid">
          <ArticleCard
            v-for="article in latest"
            :key="article.id"
            :article="article"
          />
        </div>
      </section>

      <section class="section">
        <div class="section__heading">
          <h2>分类导航</h2>
          <p>分类承担长期结构角色，帮助访客按主题查找内容。</p>
        </div>

        <CategoryNav :categories="categories" />
      </section>

      <section class="section">
        <div class="section__heading">
          <h2>项目展示</h2>
          <p>项目区已接入后端公开接口，首页会优先展示重点项目入口。</p>
        </div>

        <div class="grid cards-grid">
          <ProjectCard
            v-for="project in featuredProjects"
            :key="project.id"
            :project="project"
          />
        </div>
      </section>
    </div>
  </div>
</template>
