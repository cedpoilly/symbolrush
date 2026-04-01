export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },
  modules: ['@nuxtjs/google-fonts'],
  nitro: {
    experimental: { websocket: true },
  },
  googleFonts: {
    families: {
      'Azeret Mono': [400, 700, 900],
      'Outfit': [400, 500, 600, 700],
    },
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
    public: {
      wsUrl: process.env.WS_URL || '',
    },
  },
})
