export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui'],
  devtools: {
    enabled: true
  },
  css: ['~/assets/css/main.css'],
  ui: {
    fonts: false
  },
  runtimeConfig: {
    public: {
      appVersion: '1.0.0',
      fakeAuthToken: 'dev-token'
    }
  },
  srcDir: 'app/',
  devServer: {
    port: 5321,
    host: '0.0.0.0'
  },
  compatibilityDate: '2025-01-15',
  nitro: {},
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
