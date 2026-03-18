<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getApiErrorMessage } from '../services/api'
import { useCmsStore, type EditableProject } from '../stores/cms'

const route = useRoute()
const router = useRouter()
const cmsStore = useCmsStore()

const projectId = computed(() => route.params.id ? String(route.params.id) : undefined)
const form = reactive<EditableProject>(cmsStore.getEditableProject())
const saving = ref(false)

const syncForm = async (id?: string) => {
  try {
    if (id) {
      await cmsStore.fetchProjectById(id)
    }

    Object.assign(form, cmsStore.getEditableProject(id))
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error))
  }
}

watch(projectId, (id) => {
  void syncForm(id)
})

onMounted(() => {
  void syncForm(projectId.value)
})

const saveProject = async () => {
  saving.value = true

  try {
    const project = await cmsStore.saveProject(form)
    ElMessage.success('项目已同步到后端。')
    await router.push(`/projects/${project.id}/edit`)
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="content-stack">
    <el-form
      class="panel-card admin-form"
      label-position="top"
    >
      <div class="form-grid">
        <el-form-item label="项目标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="项目 Slug">
          <el-input v-model="form.slug" placeholder="留空则根据标题自动生成" />
        </el-form-item>
      </div>

      <div class="form-grid form-grid--3">
        <el-form-item label="项目状态">
          <el-select v-model="form.status">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序值">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="封面图">
          <el-input v-model="form.cover" placeholder="可选，填写封面图片地址" />
        </el-form-item>
      </div>

      <p class="hint-text">排序值越小越靠前，前台会优先展示排序靠前的项目。</p>

      <el-form-item label="项目摘要">
        <el-input
          v-model="form.summary"
          type="textarea"
          :rows="3"
        />
      </el-form-item>

      <div class="form-grid">
        <el-form-item label="在线预览地址">
          <el-input v-model="form.previewUrl" placeholder="https://example.com" />
        </el-form-item>
        <el-form-item label="代码仓库地址">
          <el-input v-model="form.repoUrl" placeholder="https://github.com/..." />
        </el-form-item>
      </div>

      <el-form-item label="项目详情内容">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="12"
          placeholder="支持录入前台详情页展示的项目介绍、功能说明和复盘内容"
        />
      </el-form-item>

      <div class="toolbar toolbar--between">
        <div class="inline-link-list">
          <el-link
            v-if="form.previewUrl"
            :href="form.previewUrl"
            target="_blank"
            type="primary"
          >
            打开在线预览
          </el-link>
          <el-link
            v-if="form.repoUrl"
            :href="form.repoUrl"
            target="_blank"
            type="primary"
          >
            打开代码仓库
          </el-link>
        </div>

        <div class="toolbar">
          <el-button @click="router.push('/projects')">
            返回列表
          </el-button>
          <el-button type="primary" :loading="saving" @click="saveProject">
            保存项目
          </el-button>
        </div>
      </div>
    </el-form>
  </div>
</template>
