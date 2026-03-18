<script setup lang="ts">
import { fetchCategoryPosts, fetchPublicCategories } from '~/services/api'

const route = useRoute()

const categorySlug = computed(() => String(route.params.slug))
const { data } = await useAsyncData(
  () => `category-${categorySlug.value}`,
  async () => {
    const [categories, posts] = await Promise.all([
      fetchPublicCategories(),
      fetchCategoryPosts(categorySlug.value),
    ])

    return {
      categories,
      posts: posts.items,
    }
  },
  {
    watch: [categorySlug],
  },
)

const category = computed(() =>
  (data.value?.categories ?? []).find((item) => item.slug === categorySlug.value),
)
const articles = computed(() => data.value?.posts ?? [])

if (!category.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Category not found',
  })
}

useSeoMeta({
  title: `${category.value.name} 分类`,
  description: category.value.description,
})
</script>

<template>
  <div class="page">
    <div class="container page-stack">
      <section class="card">
        <h1>分类：{{ category?.name }}</h1>
        <p>{{ category?.description }}</p>
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
        title="该分类下暂时没有已发布文章"
        description="可以先浏览其他分类，后续再回来看这里的新内容。"
      />
    </div>
  </div>
</template>
