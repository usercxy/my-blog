export default defineNuxtConfig({
  compatibilityDate: '2025-02-15',
  devtools: {
    enabled: true,
  },
  modules: ['@pinia/nuxt'],
  app: {
    head: {
      title: 'Personal Blog Demo',
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          name: 'description',
          content: 'Personal blog frontend demo built with Nuxt 3.',
        },
      ],
    },
  },
  css: ['~/styles/global.scss'],
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
    },
  },
  typescript: {
    strict: true,
  },
})
