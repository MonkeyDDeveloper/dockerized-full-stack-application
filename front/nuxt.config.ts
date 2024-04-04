// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  runtimeConfig: {
    public: {
      BACK_API_PORT: process.env.BACK_API_PORT,
      PORT: process.env.PORT || 4000,
    }
  },
  colorMode: {
    preference: 'light'
  }
})
