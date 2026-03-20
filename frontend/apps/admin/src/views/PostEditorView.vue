<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { formatFriendlyDateTime } from '@blog/shared-utils'
import PostEditorPreview from '../components/PostEditorPreview.vue'
import { getApiErrorMessage } from '../services/api'
import { useCmsStore, type EditableArticle } from '../stores/cms'

type EditorMode = 'edit' | 'split' | 'preview'

interface LocalDraft {
  savedAt: string
  payload: EditableArticle
}

interface BodyEditorRef {
  textarea?: HTMLTextAreaElement
  focus?: () => void
}

const AUTO_SAVE_DELAY = 12_000
const DRAFT_STORAGE_KEY_PREFIX = 'blog:post-draft:'

const route = useRoute()
const router = useRouter()
const cmsStore = useCmsStore()

const articleId = computed(() => route.params.id ? String(route.params.id) : undefined)
const form = reactive<EditableArticle>(cmsStore.getEditableArticle())
const formRef = ref<FormInstance>()
const bodyEditorRef = ref<BodyEditorRef>()
const viewMode = ref<EditorMode>('split')
const saving = ref(false)
const syncingForm = ref(false)
const hasHydratedForm = ref(false)
const serverSnapshot = ref('')
const lastAutoSavedAt = ref('')
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

const cloneArticlePayload = (payload: EditableArticle): EditableArticle => ({
  ...payload,
  tagIds: [...payload.tagIds],
})

const createPayloadSnapshot = (payload: EditableArticle) => JSON.stringify(cloneArticlePayload(payload))

const getDraftStorageKey = (id?: string) => `${DRAFT_STORAGE_KEY_PREFIX}${id ?? 'new'}`
const getCurrentSnapshot = () => createPayloadSnapshot(form)

const isDirty = computed(() => hasHydratedForm.value && getCurrentSnapshot() !== serverSnapshot.value)
const autoSaveHint = computed(() => {
  if (lastAutoSavedAt.value) {
    return `本地草稿最近自动保存于 ${formatFriendlyDateTime(lastAutoSavedAt.value)}`
  }

  return `自动保存每 ${AUTO_SAVE_DELAY / 1000} 秒执行一次`
})

const editorTools: Array<{ label: string; snippet: string }> = [
  { label: 'H2', snippet: '\n## 小节标题\n' },
  { label: '引用', snippet: '\n> 这里是引用内容\n' },
  { label: '代码块', snippet: '\n```ts\n// code here\n```\n' },
  { label: '链接', snippet: '[链接标题](https://example.com)' },
  { label: '图片', snippet: '![图片描述](https://example.com/cover.jpg)' },
]

const readLocalDraft = (id?: string) => {
  try {
    const raw = window.localStorage.getItem(getDraftStorageKey(id))
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as LocalDraft
    if (!parsed?.payload || typeof parsed.savedAt !== 'string') {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

const clearLocalDraft = (id?: string) => {
  try {
    window.localStorage.removeItem(getDraftStorageKey(id))
  } catch {
    // ignore
  }
}

const clearAutoSaveTimer = () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
    autoSaveTimer = null
  }
}

const persistLocalDraft = () => {
  if (!hasHydratedForm.value || syncingForm.value || !isDirty.value) {
    return
  }

  try {
    const savedAt = new Date().toISOString()
    const payload = cloneArticlePayload(form)
    window.localStorage.setItem(
      getDraftStorageKey(articleId.value),
      JSON.stringify({
        savedAt,
        payload,
      } satisfies LocalDraft),
    )
    lastAutoSavedAt.value = savedAt
  } catch {
    // ignore localStorage error and continue editing
  }
}

const scheduleAutoSave = () => {
  clearAutoSaveTimer()
  autoSaveTimer = setTimeout(() => {
    persistLocalDraft()
  }, AUTO_SAVE_DELAY)
}

const restoreLocalDraftIfNeeded = async (id?: string) => {
  const localDraft = readLocalDraft(id)
  if (!localDraft) {
    return
  }

  if (createPayloadSnapshot(localDraft.payload) === serverSnapshot.value) {
    return
  }

  try {
    await ElMessageBox.confirm(
      '检测到本地自动保存草稿，是否恢复到编辑器？',
      '恢复草稿',
      {
        type: 'info',
        confirmButtonText: '恢复草稿',
        cancelButtonText: '丢弃草稿',
      },
    )

    syncingForm.value = true
    Object.assign(form, cloneArticlePayload(localDraft.payload))
    ElMessage.success('已恢复本地草稿。')
  } catch {
    clearLocalDraft(id)
  } finally {
    syncingForm.value = false
  }
}

const focusFirstInvalidField = async () => {
  await nextTick()
  const firstInvalid = document.querySelector<HTMLElement>(
    '.admin-form .is-error input, .admin-form .is-error textarea, .admin-form .is-error .el-select__wrapper',
  )

  if (!firstInvalid) {
    return
  }

  firstInvalid.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })
  firstInvalid.focus()
}

const withPublishedValidation = (validator: (value: string) => string | null) => {
  return (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    if (form.status !== 'published') {
      callback()
      return
    }

    const message = validator(value)
    if (message) {
      callback(new Error(message))
      return
    }

    callback()
  }
}

const formRules: FormRules<EditableArticle> = {
  title: [
    {
      required: true,
      message: '请输入文章标题。',
      trigger: 'blur',
    },
  ],
  categoryId: [
    {
      required: true,
      message: '请选择一个分类。',
      trigger: 'change',
    },
  ],
  summary: [
    {
      validator: withPublishedValidation((value) => {
        if (!value?.trim()) {
          return '发布文章时需要填写摘要。'
        }

        if (value.trim().length < 30) {
          return '发布文章时摘要建议不少于 30 字。'
        }

        return null
      }),
      trigger: 'blur',
    },
  ],
  cover: [
    {
      validator: withPublishedValidation((value) => {
        if (!value?.trim()) {
          return '发布文章时需要封面图链接。'
        }

        if (!/^https?:\/\/\S+$/i.test(value.trim())) {
          return '封面图需要填写有效的 http(s) 链接。'
        }

        return null
      }),
      trigger: 'blur',
    },
  ],
  bodyText: [
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        const plainTextLength = value?.replace(/\s+/g, '').length ?? 0

        if (plainTextLength === 0) {
          callback(new Error('请填写正文内容。'))
          return
        }

        if (form.status === 'published' && plainTextLength < 120) {
          callback(new Error('发布文章时正文建议不少于 120 字。'))
          return
        }

        callback()
      },
      trigger: 'blur',
    },
  ],
}

const syncForm = async (id?: string) => {
  hasHydratedForm.value = false
  syncingForm.value = true
  clearAutoSaveTimer()

  try {
    await Promise.all([cmsStore.fetchCategories(), cmsStore.fetchTags()])

    if (id) {
      await cmsStore.fetchPostById(id)
    }

    Object.assign(form, cmsStore.getEditableArticle(id))
    serverSnapshot.value = getCurrentSnapshot()
    await restoreLocalDraftIfNeeded(id)
    hasHydratedForm.value = true
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error))
  } finally {
    syncingForm.value = false
  }
}

const saveArticle = async () => {
  if (!formRef.value) {
    return
  }

  const isValid = await formRef.value.validate().catch(() => false)

  if (!isValid) {
    await focusFirstInvalidField()
    ElMessage.warning('请先修正校验项再保存。')
    return
  }

  saving.value = true

  try {
    const article = await cmsStore.saveArticle(form)
    Object.assign(form, cmsStore.getEditableArticle(article.id))
    serverSnapshot.value = getCurrentSnapshot()
    clearLocalDraft(undefined)
    clearLocalDraft(article.id)
    ElMessage.success('文章已同步到后端。')

    if (articleId.value !== article.id) {
      await router.replace(`/posts/${article.id}/edit`)
    }
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error))
  } finally {
    saving.value = false
  }
}

const insertMarkdownSnippet = (snippet: string) => {
  const editor = bodyEditorRef.value?.textarea
  if (!editor) {
    form.bodyText += snippet
    return
  }

  const start = editor.selectionStart ?? form.bodyText.length
  const end = editor.selectionEnd ?? start
  form.bodyText = `${form.bodyText.slice(0, start)}${snippet}${form.bodyText.slice(end)}`

  void nextTick(() => {
    const nextCursor = start + snippet.length
    editor.focus()
    editor.setSelectionRange(nextCursor, nextCursor)
  })
}

const onBodyEditorKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Tab') {
    return
  }

  event.preventDefault()
  insertMarkdownSnippet('  ')
}

const handleGlobalShortcut = (event: KeyboardEvent) => {
  if (!(event.metaKey || event.ctrlKey)) {
    return
  }

  const key = event.key.toLowerCase()

  if (key === 's') {
    event.preventDefault()
    void saveArticle()
    return
  }

  if (key === 'enter') {
    event.preventDefault()
    void saveArticle()
  }
}

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!isDirty.value) {
    return
  }

  event.preventDefault()
  event.returnValue = ''
}

watch(articleId, (id) => {
  void syncForm(id)
}, { immediate: true })

watch(
  form,
  () => {
    if (!hasHydratedForm.value || syncingForm.value) {
      return
    }

    scheduleAutoSave()
  },
  { deep: true },
)

watch(() => form.status, () => {
  if (!hasHydratedForm.value || !formRef.value) {
    return
  }

  void formRef.value.validateField(['summary', 'cover', 'bodyText']).catch(() => undefined)
})

onMounted(() => {
  window.addEventListener('keydown', handleGlobalShortcut)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  clearAutoSaveTimer()
  window.removeEventListener('keydown', handleGlobalShortcut)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

onBeforeRouteLeave(async () => {
  if (!isDirty.value) {
    return true
  }

  try {
    await ElMessageBox.confirm(
      '当前有未同步到后端的修改，确认离开吗？',
      '离开编辑页',
      {
        type: 'warning',
        confirmButtonText: '仍要离开',
        cancelButtonText: '留在当前页',
      },
    )
    return true
  } catch {
    return false
  }
})
</script>

<template>
  <div class="content-stack">
    <el-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      class="panel-card admin-form"
      label-position="top"
    >
      <div class="toolbar toolbar--between post-editor-status">
        <span class="meta-badge">{{ isDirty ? '有未保存修改' : '已同步' }}</span>
        <small class="hint-text">{{ autoSaveHint }}</small>
      </div>

      <div class="form-grid">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="文章 Slug">
          <el-input v-model="form.slug" placeholder="留空则自动生成" />
        </el-form-item>
      </div>

      <el-form-item label="摘要" prop="summary">
        <el-input
          v-model="form.summary"
          type="textarea"
          :rows="3"
        />
      </el-form-item>

      <div class="form-grid form-grid--3">
        <el-form-item label="分类" prop="categoryId">
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
        <el-form-item label="封面图" prop="cover">
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

      <el-form-item
        label="正文内容（Markdown）"
        prop="bodyText"
        class="post-editor-field"
      >
        <section class="post-editor-shell">
          <div class="post-editor-toolbar">
            <div class="post-editor-toolbar__actions">
              <el-button
                v-for="tool in editorTools"
                :key="tool.label"
                text
                size="small"
                @click="insertMarkdownSnippet(tool.snippet)"
              >
                {{ tool.label }}
              </el-button>
            </div>
            <el-radio-group
              v-model="viewMode"
              size="small"
              class="post-editor-toolbar__mode"
            >
              <el-radio-button label="edit">仅编辑</el-radio-button>
              <el-radio-button label="split">分栏</el-radio-button>
              <el-radio-button label="preview">仅预览</el-radio-button>
            </el-radio-group>
          </div>

          <div class="post-editor-panels" :class="`post-editor-panels--${viewMode}`">
            <section
              v-if="viewMode !== 'preview'"
              class="post-editor-pane post-editor-pane--editor"
            >
              <el-input
                ref="bodyEditorRef"
                v-model="form.bodyText"
                type="textarea"
                :autosize="{ minRows: 18}"
                placeholder="支持 Markdown，建议按小节组织内容。"
                @keydown="onBodyEditorKeydown"
              />
              <small class="hint-text post-editor-pane__hint">
                快捷键：Ctrl/Cmd + S 保存，Ctrl/Cmd + Enter 快速保存，Tab 插入缩进。
              </small>
            </section>

            <section
              v-if="viewMode !== 'edit'"
              class="post-editor-pane post-editor-pane--preview"
            >
              <PostEditorPreview :markdown="form.bodyText" />
            </section>
          </div>
        </section>
      </el-form-item>

      <div class="toolbar toolbar--end">
        <el-checkbox v-model="form.featured">置顶推荐</el-checkbox>
        <el-checkbox v-model="form.sticky">首页突出</el-checkbox>
        <el-button @click="router.push('/posts')">
          返回列表
        </el-button>
        <el-button type="primary" :loading="saving" @click="saveArticle">
          {{ form.status === 'published' ? '保存并发布' : '保存文章' }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>
