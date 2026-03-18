<script setup lang="ts">
import { fetchAboutPage } from '~/services/api'

const siteStore = useSiteStore()
const { data: aboutPage } = await useAsyncData('about-page', fetchAboutPage)

useSeoMeta({
  title: aboutPage.value?.seoTitle || '关于我',
  description: aboutPage.value?.seoDescription || siteStore.aboutDescription,
})
</script>

<template>
  <div class="page">
    <div class="container page-stack">
      <section class="card prose-card">
        <span class="eyebrow">关于我</span>
        <p>{{ aboutPage?.summary || siteStore.aboutLead }}</p>
        <p>{{ aboutPage?.content || siteStore.aboutDescription }}</p>
      </section>

      <section class="about-grid">
        <article class="card">
          <h2>技能栈</h2>
          <ul class="pill-list">
            <li
              v-for="skill in siteStore.skills"
              :key="skill"
            >
              {{ skill }}
            </li>
          </ul>
        </article>

        <article class="card">
          <h2>经历</h2>
          <div class="timeline">
            <div
              v-for="item in siteStore.experiences"
              :key="item.period"
              class="timeline__item"
            >
              <strong>{{ item.period }}</strong>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </article>

        <article class="card">
          <h2>联系方式</h2>
          <p>邮箱：{{ siteStore.contactEmail }}</p>
          <div class="footer-links footer-links--left">
            <a
              v-for="link in siteStore.socialLinks"
              :key="link.href"
              :href="link.href"
              target="_blank"
              rel="noreferrer"
            >
              {{ link.label }}
            </a>
          </div>
        </article>
      </section>
    </div>
  </div>
</template>
