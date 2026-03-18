<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useCmsStore } from '../stores/cms'
import { getApiErrorMessage } from '../services/api'

const cmsStore = useCmsStore()

const quickActions = [
  { label: '写新文章', to: '/posts/create' },
  { label: '添加项目', to: '/projects/create' },
  { label: '调整站点设置', to: '/settings' },
]

const recentArticles = computed(() => cmsStore.recentArticles.slice(0, 5))

onMounted(async () => {
  try {
    await cmsStore.fetchDashboard()
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error))
  }
})
</script>

<template>
  <div class="content-stack">
    <section class="hero-surface">
      <div class="hero-surface__content">
        <span class="page-kicker">Control Room</span>
        <h3>把博客当作一份持续经营的内容产品来管理。</h3>
        <p>
          这里聚合文章、项目、分类和站点设置，适合快速查看站点状态，并从同一入口继续编辑与发布。
        </p>
        <div class="hero-actions">
          <RouterLink
            v-for="action in quickActions"
            :key="action.to"
            :to="action.to"
            class="hero-link"
          >
            {{ action.label }}
          </RouterLink>
        </div>
      </div>

      <div class="hero-surface__aside">
        <p class="hero-surface__label">今日焦点</p>
        <strong>{{ cmsStore.metrics[0]?.value ?? '0' }}</strong>
        <span>篇内容正在后台管理范围内。</span>
      </div>
    </section>

    <div class="metrics-grid">
      <article
        v-for="card in cmsStore.metrics"
        :key="card.label"
        class="metric-card"
      >
        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
        <small>{{ card.hint }}</small>
      </article>
    </div>

    <section class="dashboard-grid">
      <article class="panel-card">
        <div class="section-header">
          <div>
            <span class="page-kicker">Recent Activity</span>
            <h3>最近更新</h3>
          </div>
        </div>

        <div v-if="recentArticles.length" class="simple-list">
          <div
            v-for="article in recentArticles"
            :key="article.id"
            class="simple-list__item"
          >
            <div class="cell-stack">
              <strong class="cell-stack__title">{{ article.title }}</strong>
              <p class="cell-stack__meta">{{ article.summary || '这篇文章暂未填写摘要。' }}</p>
            </div>
            <span class="admin-pill">{{ article.updatedAt }}</span>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>还没有最近更新内容，先去创建第一篇文章吧。</p>
        </div>
      </article>

      <article class="panel-card">
        <div class="section-header">
          <div>
            <span class="page-kicker">Workflow Notes</span>
            <h3>操作建议</h3>
          </div>
        </div>

        <ul class="insight-list">
          <li>优先保持分类和标签命名统一，避免前台出现重复语义。</li>
          <li>项目排序值越小越靠前，建议把核心作品固定在最前面。</li>
          <li>SEO 文案与关于页内容建议按季度检查一次，保持站点定位清晰。</li>
        </ul>
      </article>
    </section>
  </div>
</template>
