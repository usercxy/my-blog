<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <section class="card empty-state">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </section>
</template>
