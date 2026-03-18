<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Delete, EditPen } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getApiErrorMessage } from '../services/api'
import { useCmsStore, type ProjectStatus } from '../stores/cms'

const router = useRouter()
const cmsStore = useCmsStore()

const filters = reactive({
  keyword: '',
  status: 'all' as ProjectStatus | 'all',
})

const statusMeta: Record<ProjectStatus, { label: string; type: 'info' | 'success' | 'warning' }> = {
  draft: { label: '草稿', type: 'info' },
  published: { label: '已发布', type: 'success' },
  archived: { label: '已归档', type: 'warning' },
}

const getStatusMeta = (status: ProjectStatus) => statusMeta[status]

const filteredProjects = computed(() =>
  cmsStore.projects.filter((project) => {
    const matchesKeyword = !filters.keyword
      || `${project.title} ${project.summary} ${project.slug}`
        .toLowerCase()
        .includes(filters.keyword.toLowerCase())
    const matchesStatus = filters.status === 'all' || project.status === filters.status
    return matchesKeyword && matchesStatus
  }),
)

const projectSummary = computed(() => `共 ${cmsStore.projects.length} 个项目，当前筛选结果 ${filteredProjects.value.length} 个`)

const toEditor = (id?: string) => {
  router.push(id ? `/projects/${id}/edit` : '/projects/create')
}

const removeProject = async (id: string) => {
  try {
    await ElMessageBox.confirm('删除后前台项目页将无法继续展示该项目，是否继续？', '删除项目', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
    })

    await cmsStore.deleteProject(id)
    ElMessage.success('项目已删除。')
  } catch (error) {
    if (error === 'cancel' || error === 'close') {
      return
    }

    ElMessage.error(getApiErrorMessage(error))
  }
}

onMounted(async () => {
  try {
    await cmsStore.fetchProjects()
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
          <span class="page-kicker">Portfolio Pipeline</span>
          <h3>项目列表</h3>
          <p>{{ projectSummary }}</p>
        </div>
      </div>

      <div class="toolbar command-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索标题、摘要或 slug"
          clearable
        />
        <el-select
          v-model="filters.status"
          style="width: 180px"
        >
          <el-option label="全部状态" value="all" />
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
          <el-option label="已归档" value="archived" />
        </el-select>
        <el-button type="primary" @click="toEditor()">
          新建项目
        </el-button>
      </div>

      <el-table
        :data="filteredProjects"
        class="admin-table"
        stripe
      >
        <el-table-column label="项目信息" min-width="320">
          <template #default="{ row }">
            <div class="cell-stack">
              <span class="cell-stack__title">{{ row.title }}</span>
              <span class="cell-stack__meta">{{ row.summary || '暂无摘要' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="slug" label="Slug" min-width="180" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusMeta(row.status).type">
              {{ getStatusMeta(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="100" align="center">
          <template #default="{ row }">
            {{ row.sortOrder }}
          </template>
        </el-table-column>
        <el-table-column label="前台展示" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.featured ? 'success' : 'info'">
              {{ row.featured ? '优先展示' : '正常排序' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="最后更新" width="180" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <div class="icon-action-group">
              <el-tooltip content="编辑" placement="top">
                <el-button
                  class="icon-action-button icon-action-button--primary"
                  text
                  type="primary"
                  aria-label="编辑"
                  @click="toEditor(row.id)"
                >
                  <el-icon class="icon-action-button__icon">
                    <EditPen />
                  </el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button
                  class="icon-action-button icon-action-button--danger"
                  text
                  type="danger"
                  aria-label="删除"
                  @click="removeProject(row.id)"
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
