<script setup lang="ts">
import { formatDateLabel } from '@blog/shared-utils'
import { fetchSearchResults } from '~/services/api'

const route = useRoute()
const router = useRouter()

const keyword = ref(String(route.query.q ?? ''))

watch(
  () => route.query.q,
  (value) => {
    keyword.value = String(value ?? '')
  },
  { immediate: true },
)

const { data } = await useAsyncData(
  () => `search-${keyword.value}`,
  async () => {
    if (!keyword.value.trim()) {
      return []
    }

    const results = await fetchSearchResults(keyword.value)
    return results.items
  },
  {
    watch: [keyword],
  },
)

const results = computed(() => data.value ?? [])

const submitSearch = () => {
  router.replace({
    query: keyword.value ? { q: keyword.value } : {},
  })
}

useSeoMeta({
  title: '搜索',
  description: '搜索文章标题、摘要和正文内容。',
})
</script>

<template>
  <div class="page">
    <div class="container page-stack">
      <section class="card">
        <h1>搜索结果页</h1>
        <p>搜索标题、摘要、标签和正文片段，结果来自后端公开搜索接口。</p>
      </section>

      <form
        class="card filters-card"
        @submit.prevent="submitSearch"
      >
        <label class="field">
          <span>关键词</span>
          <input
            v-model="keyword"
            type="search"
            placeholder="输入你想查找的内容"
          >
        </label>
        <button
          class="button button--primary"
          type="submit"
        >
          开始搜索
        </button>
      </form>

      <div
        v-if="results.length"
        class="content-stack"
      >
        <article
          v-for="result in results"
          :key="result.id"
          class="card"
        >
          <NuxtLink :to="`/articles/${result.slug}`">
            <h2>{{ result.title }}</h2>
          </NuxtLink>
          <p>{{ result.summary || result.snippet }}</p>
          <p v-if="result.snippet">
            {{ result.snippet }}
          </p>
          <div class="article-meta">
            <span v-if="result.publishedAt">{{ formatDateLabel(result.publishedAt) }}</span>
            <NuxtLink
              v-for="category in result.categories"
              :key="category.id"
              :to="`/category/${category.slug}`"
              class="meta-chip"
            >
              {{ category.name }}
            </NuxtLink>
            <NuxtLink
              v-for="tag in result.tags"
              :key="tag.id"
              :to="`/tag/${tag.slug}`"
              class="meta-chip meta-chip--ghost"
            >
              #{{ tag.name }}
            </NuxtLink>
          </div>
        </article>
      </div>

      <EmptyState
        v-else
        title="还没有搜索结果"
        description="你可以试试 Nuxt、后台、SEO、分类 等关键词。"
      />
    </div>
  </div>
</template>
