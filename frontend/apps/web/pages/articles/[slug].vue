<script setup lang="ts">
import {
  buildArticleNeighbors,
  buildRelatedArticles,
  fetchPublicPostDetail,
  fetchPublicPosts,
} from '~/services/api'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const { data } = await useAsyncData(
  () => `article-${slug.value}`,
  async () => {
    const [article, posts] = await Promise.all([
      fetchPublicPostDetail(slug.value),
      fetchPublicPosts({ pageSize: 100 }),
    ])

    return {
      article,
      posts: posts.items,
    }
  },
  {
    watch: [slug],
  },
)

const article = computed(() => data.value?.article)
const neighbors = computed(() => buildArticleNeighbors(data.value?.posts ?? [], slug.value))
const relatedArticles = computed(() =>
  article.value ? buildRelatedArticles(data.value?.posts ?? [], article.value) : [],
)

if (!article.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Article not found',
  })
}

useSeoMeta({
  title: article.value.seoTitle,
  description: article.value.seoDescription,
})
</script>

<template>
  <div class="page">
    <div class="container page-stack">
      <section
        v-if="article"
        class="article-layout"
      >
        <article class="card article-detail">
          <span class="eyebrow">文章详情</span>
          <h1>{{ article.title }}</h1>
          <p class="article-detail__summary">{{ article.summary }}</p>
          <ArticleMeta
            :published-at="article.publishedAt"
            :updated-at="article.updatedAt"
            :reading-time="article.readingTime"
            :category="article.category"
            :tags="article.tags"
          />

          <section
            v-for="section in article.sections"
            :id="section.id"
            :key="section.id"
            class="article-section"
          >
            <h2>{{ section.title }}</h2>
            <p
              v-for="paragraph in section.paragraphs"
              :key="paragraph"
            >
              {{ paragraph }}
            </p>
          </section>

          <div class="article-neighbors">
            <NuxtLink
              v-if="neighbors.prev"
              :to="`/articles/${neighbors.prev.slug}`"
              class="card article-neighbor"
            >
              <span>上一篇</span>
              <strong>{{ neighbors.prev.title }}</strong>
            </NuxtLink>
            <NuxtLink
              v-if="neighbors.next"
              :to="`/articles/${neighbors.next.slug}`"
              class="card article-neighbor"
            >
              <span>下一篇</span>
              <strong>{{ neighbors.next.title }}</strong>
            </NuxtLink>
          </div>
        </article>

        <aside class="card article-toc">
          <h2>目录</h2>
          <nav>
            <a
              v-for="section in article.sections"
              :key="section.id"
              :href="`#${section.id}`"
            >
              {{ section.title }}
            </a>
          </nav>

          <div class="article-toc__related">
            <h3>相关推荐</h3>
            <NuxtLink
              v-for="item in relatedArticles"
              :key="item.id"
              :to="`/articles/${item.slug}`"
              class="text-link"
            >
              {{ item.title }}
            </NuxtLink>
          </div>
        </aside>
      </section>
    </div>
  </div>
</template>
