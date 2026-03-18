<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getApiErrorMessage } from '../services/api'
import { useCmsStore, type EditableArticle } from '../stores/cms'

const route = useRoute()
const router = useRouter()
const cmsStore = useCmsStore()

const articleId = computed(() => route.params.id ? String(route.params.id) : undefined)
const form = reactive<EditableArticle>(cmsStore.getEditableArticle())
const saving = ref(false)

const syncForm = async (id?: string) => {
  try {
    await Promise.all([cmsStore.fetchCategories(), cmsStore.fetchTags()])

    if (id) {
      await cmsStore.fetchPostById(id)
    }

    Object.assign(form, cmsStore.getEditableArticle(id))
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error))
  }
}

watch(articleId, (id) => {
  void syncForm(id)
})

onMounted(() => {
  void syncForm(articleId.value)
})

const saveArticle = async () => {
  saving.value = true

  try {
    const article = await cmsStore.saveArticle(form)
    ElMessage.success('文章已同步到后端。')
    await router.push(`/posts/${article.id}/edit`)
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
        <el-form-item label="文章标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="文章 Slug">
          <el-input v-model="form.slug" placeholder="留空则自动生成" />
        </el-form-item>
      </div>

      <el-form-item label="摘要">
        <el-input
          v-model="form.summary"
          type="textarea"
          :rows="3"
        />
      </el-form-item>

      <div class="form-grid form-grid--3">
        <el-form-item label="分类">
          <el-select v-model="form.categoryId">
            <el-option
              v-for="category in cmsStore.categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="隐藏" value="hidden" />
          </el-select>
        </el-form-item>
        <el-form-item label="阅读时长（展示值）">
          <el-input-number v-model="form.readingTime" :min="1" :max="60" disabled />
        </el-form-item>
      </div>

      <el-form-item label="标签">
        <el-checkbox-group v-model="form.tagIds">
          <el-checkbox
            v-for="tag in cmsStore.tags"
            :key="tag.id"
            :label="tag.id"
          >
            {{ tag.name }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <div class="form-grid">
        <el-form-item label="封面图">
          <el-input v-model="form.cover" />
        </el-form-item>
        <el-form-item label="发布日期">
          <el-input v-model="form.publishedAt" type="date" disabled />
        </el-form-item>
      </div>

      <div class="form-grid">
        <el-form-item label="SEO 标题">
          <el-input v-model="form.seoTitle" />
        </el-form-item>
        <el-form-item label="SEO 描述">
          <el-input v-model="form.seoDescription" />
        </el-form-item>
      </div>

      <el-form-item label="正文内容（段落间空一行）">
        <el-input
          v-model="form.bodyText"
          type="textarea"
          :rows="12"
        />
      </el-form-item>

      <div class="toolbar toolbar--end">
        <el-checkbox v-model="form.featured">置顶推荐</el-checkbox>
        <el-checkbox v-model="form.sticky">首页突出</el-checkbox>
        <el-button @click="router.push('/posts')">
          返回列表
        </el-button>
        <el-button type="primary" :loading="saving" @click="saveArticle">
          保存文章
        </el-button>
      </div>
    </el-form>
  </div>
</template>
