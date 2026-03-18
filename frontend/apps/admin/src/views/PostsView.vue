<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import type { ArticleStatus } from '@blog/shared-types'
import { useRouter } from 'vue-router'
import { Delete, EditPen } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCmsStore } from '../stores/cms'
import { getApiErrorMessage } from '../services/api'

const router = useRouter()
const cmsStore = useCmsStore()

const filters = reactive({
  keyword: '',
  status: 'all',
})

const statusMeta: Record<ArticleStatus, { label: string; type: 'info' | 'success' | 'warning' }> = {
  draft: { label: '草稿', type: 'info' },
  published: { label: '已发布', type: 'success' },
  hidden: { label: '隐藏', type: 'warning' },
}

const getStatusMeta = (status: ArticleStatus) => statusMeta[status]

const filteredArticles = computed(() =>
  cmsStore.articles.filter((article) => {
    const matchesKeyword = !filters.keyword
      || `${article.title} ${article.summary}`.toLowerCase().includes(filters.keyword.toLowerCase())
    const matchesStatus = filters.status === 'all' || article.status === filters.status
    return matchesKeyword && matchesStatus
  }),
)

const articleSummary = computed(() => `共 ${cmsStore.articles.length} 篇，当前筛选结果 ${filteredArticles.value.length} 篇`)

const toEditor = (id?: string) => {
  router.push(id ? `/posts/${id}/edit` : '/posts/create')
}

const removeArticle = async (id: string) => {
  try {
    await ElMessageBox.confirm('删除后文章将无法在前台继续访问，是否继续？', '删除文章', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
    })

    await cmsStore.deleteArticle(id)
    ElMessage.success('文章已删除。')
  } catch (error) {
    if (error === 'cancel' || error === 'close') {
      return
    }

    ElMessage.error(getApiErrorMessage(error))
  }
}

onMounted(async () => {
  try {
    await cmsStore.fetchPosts()
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error))
  }
})
</script>

<template>
  <div class="content-stack">
    <section class="panel-card table-shell">
      <div class="section-header">
        <div>
          <span class="page-kicker">Publishing Queue</span>
          <h3>文章列表</h3>
          <p>{{ articleSummary }}</p>
        </div>
      </div>

      <div class="toolbar command-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索标题或摘要"
          clearable
        />
        <el-select
          v-model="filters.status"
          style="width: 180px"
        >
          <el-option label="全部状态" value="all" />
          <el-option label="已发布" value="published" />
          <el-option label="草稿" value="draft" />
          <el-option label="隐藏" value="hidden" />
        </el-select>
        <el-button type="primary" @click="toEditor()">
          新建文章
        </el-button>
      </div>

      <el-table
        :data="filteredArticles"
        class="admin-table"
        stripe
      >
        <el-table-column prop="title" label="标题" min-width="240" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusMeta(row.status).type">
              {{ getStatusMeta(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishedAt" label="发布时间" width="140" />
        <el-table-column prop="updatedAt" label="最后更新" width="140" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <div class="icon-action-group">
              <el-tooltip content="编辑文章" placement="top">
                <el-button
                  class="icon-action-button icon-action-button--primary"
                  text
                  type="primary"
                  aria-label="编辑文章"
                  @click="toEditor(row.id)"
                >
                  <el-icon class="icon-action-button__icon">
                    <EditPen />
                  </el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="删除文章" placement="top">
                <el-button
                  class="icon-action-button icon-action-button--danger"
                  text
                  type="danger"
                  aria-label="删除文章"
                  @click="removeArticle(row.id)"
                >
                  <el-icon class="icon-action-button__icon">
                    <Delete />
                  </el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>
