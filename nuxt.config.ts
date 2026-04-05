export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: false },

  modules: [
    '@nuxt/ui',
    '@nuxt/hints',
    '@nuxtjs/google-fonts',
    '@nuxtjs/storybook',
  ],

  colorMode: {
    preference: 'dark', // TODO: add a light/dark mode toggle in the UI
  },

  ui: {
    theme: {
      colors: ['primary', 'secondary', 'success', 'error', 'warning', 'neutral'],
    },
  },

  storybook: {
    url: 'http://localhost:6006',
    port: 6006,
  },

  vite: {
    server: {
      allowedHosts: true,
      hmr: false,
    },
  },

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
