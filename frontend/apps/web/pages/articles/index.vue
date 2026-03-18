<script setup lang="ts">
import { fetchCategoryPosts, fetchPublicCategories, fetchPublicPosts } from '~/services/api'

const route = useRoute()
const router = useRouter()

const searchKeyword = computed({
  get: () => String(route.query.keyword ?? ''),
  set: (value: string) => {
    router.replace({
      query: value ? { ...route.query, keyword: value } : {},
    })
  },
})

const categorySlug = computed(() => String(route.query.category ?? ''))

const { data } = await useAsyncData(
  () => `articles-${searchKeyword.value}-${categorySlug.value}`,
  async () => {
    const [categories, posts] = await Promise.all([
      fetchPublicCategories(),
      searchKeyword.value
        ? fetchPublicPosts({
            keyword: searchKeyword.value,
            pageSize: 100,
          })
        : categorySlug.value
        ? fetchCategoryPosts(categorySlug.value)
        : fetchPublicPosts({
            pageSize: 100,
          }),
    ])

    return {
      categories,
      posts: posts.items,
    }
  },
  {
    watch: [searchKeyword, categorySlug],
  },
)

const categories = computed(() => data.value?.categories ?? [])
const filteredArticles = computed(() => data.value?.posts ?? [])

useSeoMeta({
  title: '文章列表',
  description: '浏览博客文章列表，并按关键词或分类筛选内容。',
})
</script>

<template>
  <div class="page">
    <div class="container page-stack">
      <section class="section__heading">
        <h1>文章列表</h1>
        <p>支持基础关键词搜索和分类筛选，当前内容已接入后端公开接口。</p>
      </section>

      <section class="card filters-card">
        <label class="field">
          <span>搜索文章</span>
          <input
            v-model="searchKeyword"
            type="search"
            placeholder="输入关键词，如 Nuxt / SEO / 后台"
          >
        </label>

        <div class="filters-card__chips">
          <NuxtLink
            class="meta-chip"
            to="/articles"
          >
            全部
          </NuxtLink>
          <NuxtLink
            v-for="category in categories"
            :key="category.id"
            class="meta-chip meta-chip--ghost"
            :to="{
              path: '/articles',
              query: { category: category.slug },
            }"
          >
            {{ category.name }}
          </NuxtLink>
        </div>
      </section>

      <div
        v-if="filteredArticles.length"
        class="grid cards-grid"
      >
        <ArticleCard
          v-for="article in filteredArticles"
          :key="article.id"
          :article="article"
        />
      </div>

      <EmptyState
        v-else
        title="没有找到匹配文章"
        description="可以尝试换一个关键词，或者先回到全部文章列表继续浏览。"
      />
    </div>
  </div>
</template>
