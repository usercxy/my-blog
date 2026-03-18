<script setup lang="ts">
import { fetchPublicTags, fetchTagPosts } from '~/services/api'

const route = useRoute()

const tagSlug = computed(() => String(route.params.slug))
const { data } = await useAsyncData(
  () => `tag-${tagSlug.value}`,
  async () => {
    const [tags, posts] = await Promise.all([
      fetchPublicTags(),
      fetchTagPosts(tagSlug.value),
    ])

    return {
      tags,
      posts: posts.items,
    }
  },
  {
    watch: [tagSlug],
  },
)

const tag = computed(() => (data.value?.tags ?? []).find((item) => item.slug === tagSlug.value))
const articles = computed(() => data.value?.posts ?? [])

if (!tag.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Tag not found',
  })
}

useSeoMeta({
  title: `标签：${tag.value.name}`,
  description: `浏览与 ${tag.value.name} 相关的全部文章。`,
})
</script>

<template>
  <div class="page">
    <div class="container page-stack">
      <section class="card">
        <h1>标签：{{ tag?.name }}</h1>
        <p>浏览和当前主题相关的全部文章内容。</p>
      </section>

      <div
        v-if="articles.length"
        class="grid cards-grid"
      >
        <ArticleCard
          v-for="article in articles"
          :key="article.id"
          :article="article"
        />
      </div>

      <EmptyState
        v-else
        title="该标签下暂无结果"
        description="可以尝试切换到其他标签，或者直接通过搜索页查找。"
      />
    </div>
  </div>
</template>
