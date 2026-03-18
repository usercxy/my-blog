<script setup lang="ts">
import { fetchPublicProjects } from '~/services/api'

const { data: projects } = await useAsyncData('projects', fetchPublicProjects)

useSeoMeta({
  title: '项目',
  description: '浏览博客作者的项目与作品展示。',
})
</script>

<template>
  <div class="page">
    <div class="container page-stack">
      <section class="card">
        <h1>项目列表页</h1>
        <p>项目列表已接入后端公开接口，可展示在线项目摘要和详情入口。</p>
      </section>

      <div class="grid cards-grid">
        <ProjectCard
          v-for="project in projects ?? []"
          :key="project.id"
          :project="project"
        />
      </div>
    </div>
  </div>
</template>
