import { cloneSiteSettings } from '@blog/shared-utils'
import { fetchSiteSettings } from '~/services/api'

export const useSiteStore = defineStore('site', {
  state: () => ({
    settings: cloneSiteSettings(),
    loaded: false,
  }),
  getters: {
    siteName: (state) => state.settings.siteName,
    siteSubtitle: (state) => state.settings.siteSubtitle,
    heroTitle: (state) => state.settings.heroTitle,
    heroDescription: (state) => state.settings.heroDescription,
    footerText: (state) => state.settings.footerText,
    navigation: (state) => state.settings.navigation,
    socialLinks: (state) => state.settings.socialLinks,
    aboutLead: (state) => state.settings.aboutLead,
    aboutDescription: (state) => state.settings.aboutDescription,
    skills: (state) => state.settings.skills,
    experiences: (state) => state.settings.experiences,
    contactEmail: (state) => state.settings.contactEmail,
  },
  actions: {
    async fetchSettings(force = false) {
      if (this.loaded && !force) {
        return this.settings
      }

      this.settings = await fetchSiteSettings()
      this.loaded = true

      return this.settings
    },
  },
})
