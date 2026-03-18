<script setup lang="ts">
import { useSiteStore } from '~/stores/site'

defineProps<{
  text: string
}>()

const siteStore = useSiteStore()
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <p>{{ text }}</p>
      <div class="footer-links">
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
    </div>
  </footer>
</template>
