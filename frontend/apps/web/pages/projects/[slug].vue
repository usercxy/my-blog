<script setup lang="ts">
import { fetchProjectDetail } from '~/services/api'

const route = useRoute()

const slug = computed(() => String(route.params.slug))
const { data: project } = await useAsyncData(
  () => `project-${slug.value}`,
  () => fetchProjectDetail(slug.value),
  {
    watch: [slug],
  },
)

if (!project.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Project not found',
  })
}

useSeoMeta({
  title: `${project.value.name} 项目详情`,
  description: project.value.summary,
})
</script>

<template>
  <div class="page">
    <div class="container page-stack">
      <section class="card project-detail">
        <span class="eyebrow">项目详情</span>
        <h1>{{ project?.name }}</h1>
        <p>{{ project?.description }}</p>
        <ul
          v-if="project?.techStack.length"
          class="pill-list"
        >
          <li
            v-for="item in project?.techStack ?? []"
            :key="item"
          >
            {{ item }}
          </li>
        </ul>
        <a
          v-if="project?.href"
          :href="project.href"
          target="_blank"
          rel="noreferrer"
          class="button button--primary"
        >
          打开项目链接
        </a>
      </section>
    </div>
  </div>
</template>
