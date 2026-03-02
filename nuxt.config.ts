export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui'],
  ui: {
    fonts: false
  },
  srcDir: 'app/',
  css: ['~/assets/css/main.css'],
  devtools: {
    enabled: true
  },
  compatibilityDate: '2025-01-15',
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  devServer: {
    port: 5321,
    host: '0.0.0.0'
  },
  nitro: {},
  runtimeConfig: {
    public: {
      appVersion: '1.0.0',
      fakeAuthToken: 'dev-token'
    }
  }
})
