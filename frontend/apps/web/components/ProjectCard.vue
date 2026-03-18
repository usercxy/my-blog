<script setup lang="ts">
import type { Project } from '@blog/shared-types'

defineProps<{
  project: Project
}>()
</script>

<template>
  <article class="card project-card">
    <span
      v-if="project.featured"
      class="eyebrow"
    >
      Featured Project
    </span>
    <h3>{{ project.name }}</h3>
    <p>{{ project.summary }}</p>
    <ul
      v-if="project.techStack.length"
      class="pill-list"
    >
      <li
        v-for="item in project.techStack"
        :key="item"
      >
        {{ item }}
      </li>
    </ul>
    <div class="project-card__actions">
      <NuxtLink
        :to="`/projects/${project.slug}`"
        class="text-link"
      >
        查看详情
      </NuxtLink>
      <a
        v-if="project.href"
        :href="project.href"
        target="_blank"
        rel="noreferrer"
        class="text-link"
      >
        外链预览
      </a>
    </div>
  </article>
</template>
