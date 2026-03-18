<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Delete, Close } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCmsStore } from '../stores/cms'
import { getApiErrorMessage } from '../services/api'

const cmsStore = useCmsStore()
const tagName = ref('')

const submitTag = async () => {
  try {
    await cmsStore.addTag(tagName.value)
    tagName.value = ''
    ElMessage.success('标签已同步到后端。')
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error))
  }
}

const removeTag = async (id: string) => {
  try {
    await ElMessageBox.confirm(
      '删除标签前请确保没有文章仍在使用它，否则后端会拒绝删除。',
      '删除标签',
      {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
      },
    )

    await cmsStore.deleteTag(id)
    ElMessage.success('标签已删除。')
  } catch (error) {
    if (error === 'cancel' || error === 'close') {
      return
    }

    ElMessage.error(getApiErrorMessage(error))
  }
}

onMounted(async () => {
  try {
    await cmsStore.fetchTags()
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error))
  }
})
</script>

<template>
  <div class="content-stack">
    <div class="tag-layout">
      <section class="panel-card tag-create-card">
        <div class="section-header">
          <div>
            <span class="page-kicker">Tag Builder</span>
            <h3>新增标签</h3>
            <p>标签适合做跨分类的话题组织，命名建议偏主题而不是栏目。</p>
          </div>
        </div>

        <div class="toolbar">
          <el-input v-model="tagName" placeholder="标签名称" />
          <el-button type="primary" @click="submitTag">
            新增标签
          </el-button>
        </div>
      </section>

      <section class="panel-card tag-shelf-card">
        <div class="section-header">
          <div>
            <span class="page-kicker">Tag Shelf</span>
            <h3>标签集合</h3>
            <p>当前共 {{ cmsStore.tags.length }} 个标签。</p>
          </div>
        </div>

        <ul class="tag-cloud">
          <li
            v-for="tag in cmsStore.tags"
            :key="tag.id"
          >
            <span>{{ tag.name }}</span>
              <el-button
                class="icon-action-button icon-action-button--danger"
                link
                aria-label="删除"
                @click="removeTag(tag.id)"
              >
                <el-icon class="icon-action-button__icon">
                  <Close />
                </el-icon>
              </el-button>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
