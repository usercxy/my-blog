<script setup lang="ts">
import { computed } from 'vue'
import { useSiteStore } from '~/stores/site'

const siteStore = useSiteStore()
const links = computed(() => siteStore.navigation)
</script>

<template>
  <header class="app-header">
    <div class="container app-header__inner">
      <NuxtLink class="brand" to="/">
        <span>{{ siteStore.siteName }}</span>
        <small>{{ siteStore.siteSubtitle }}</small>
      </NuxtLink>
      <nav class="nav">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="nav__link"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
