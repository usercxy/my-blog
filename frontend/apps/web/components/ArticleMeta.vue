<script setup lang="ts">
import type { Category, Tag } from '@blog/shared-types'
import { formatDateLabel } from '@blog/shared-utils'

defineProps<{
  publishedAt: string
  updatedAt: string
  readingTime: number
  category?: Category
  tags?: Tag[]
}>()
</script>

<template>
  <div class="article-meta">
    <span>{{ formatDateLabel(publishedAt) }}</span>
    <span>更新于 {{ formatDateLabel(updatedAt) }}</span>
    <span>{{ readingTime }} 分钟阅读</span>
    <NuxtLink
      v-if="category"
      :to="`/category/${category.slug}`"
      class="meta-chip"
    >
      {{ category.name }}
    </NuxtLink>
    <NuxtLink
      v-for="tag in tags ?? []"
      :key="tag.id"
      :to="`/tag/${tag.slug}`"
      class="meta-chip meta-chip--ghost"
    >
      #{{ tag.name }}
    </NuxtLink>
  </div>
</template>
