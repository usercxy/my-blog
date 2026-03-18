<script setup lang="ts">
import type { Category } from '@blog/shared-types'

defineProps<{
  categories: Category[]
}>()
</script>

<template>
  <div class="category-nav">
    <NuxtLink
      v-for="category in categories"
      :key="category.id"
      :to="`/category/${category.slug}`"
      class="category-nav__item"
    >
      <strong>{{ category.name }}</strong>
      <span>{{ category.description }}</span>
    </NuxtLink>
  </div>
</template>
