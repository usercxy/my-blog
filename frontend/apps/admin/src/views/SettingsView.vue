<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getApiErrorMessage } from '../services/api'
import { useCmsStore, type SiteConfigForm } from '../stores/cms'

const cmsStore = useCmsStore()
const form = reactive<SiteConfigForm>({
  siteName: '',
  siteDescription: '',
  siteUrl: '',
  seoTitle: '',
  seoDescription: '',
  aboutSummary: '',
  aboutContent: '',
  skillsText: '',
  experiencesText: '',
  contactEmail: '',
  socialLinksText: '',
})
const saving = ref(false)

const syncForm = async () => {
  try {
    const siteConfig = await cmsStore.fetchSiteSettings()
    Object.assign(form, siteConfig)
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error))
  }
}

onMounted(() => {
  void syncForm()
})

const saveSettings = async () => {
  saving.value = true

  try {
    await cmsStore.saveSiteSettings(form)
    ElMessage.success('站点设置已同步到后端。')
  } catch (error) {
    ElMessage.error(getApiErrorMessage(error))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="content-stack">
    <div class="settings-layout">
      <aside class="panel-card">
        <div class="section-header">
          <div>
            <span class="page-kicker">Editing Guide</span>
            <h3>设置建议</h3>
          </div>
        </div>

        <ul class="insight-list">
          <li>站点名称和 SEO 标题建议保持一致的品牌语气，减少搜索结果认知偏差。</li>
          <li>关于页摘要可偏简短定位，正文再补充背景与经验，利于前台层次展示。</li>
          <li>社交链接与联系邮箱建议定期检查，避免表单和跳转失效。</li>
        </ul>
      </aside>

      <el-form
        class="panel-card admin-form"
        label-position="top"
      >
        <div class="form-grid">
          <el-form-item label="站点名称">
            <el-input v-model="form.siteName" />
          </el-form-item>
          <el-form-item label="站点简介">
            <el-input v-model="form.siteDescription" />
          </el-form-item>
        </div>

        <el-form-item label="站点地址">
          <el-input v-model="form.siteUrl" placeholder="https://example.com" />
        </el-form-item>

        <div class="form-grid">
          <el-form-item label="SEO 标题">
            <el-input v-model="form.seoTitle" />
          </el-form-item>
          <el-form-item label="SEO 描述">
            <el-input v-model="form.seoDescription" />
          </el-form-item>
        </div>

        <el-form-item label="关于页摘要">
          <el-input
            v-model="form.aboutSummary"
            type="textarea"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="关于页正文">
          <el-input
            v-model="form.aboutContent"
            type="textarea"
            :rows="8"
          />
        </el-form-item>

        <el-form-item label="技能栈">
          <el-input
            v-model="form.skillsText"
            type="textarea"
            :rows="5"
            placeholder="每行一个技能，或使用逗号分隔"
          />
        </el-form-item>

        <el-form-item label="经历">
          <el-input
            v-model="form.experiencesText"
            type="textarea"
            :rows="6"
            placeholder="每行一条，格式：时间段 | 标题 | 描述"
          />
        </el-form-item>

        <el-form-item label="联系邮箱">
          <el-input
            v-model="form.contactEmail"
            placeholder="name@example.com"
          />
        </el-form-item>

        <el-form-item label="社交链接">
          <el-input
            v-model="form.socialLinksText"
            type="textarea"
            :rows="5"
            placeholder="每行一条，格式：名称 | 链接"
          />
        </el-form-item>

        <div class="toolbar toolbar--end">
          <el-button type="primary" :loading="saving" @click="saveSettings">
            保存设置
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>
