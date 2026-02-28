// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/supabase',
    '@nuxt/image'
  ],

  // Pinia 配置
  pinia: {
    autoImports: [
      'defineStore',
      ['defineStore', 'definePiniaStore'],
    ],
    storesDirs: ['./stores/**']
  },

  ui: {
    icons: {
      provider: 'iconify'
    }
  },

  tailwindcss: {
    config: {
      theme: {
        fontFamily: {
          sans: ['system-ui', '-apple-system', 'sans-serif']
        }
      }
    }
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
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

  // 服务器配置，设置端口为5321
  server: {
    port: 5321,
    host: '0.0.0.0'
  },

  nitro: {
    devProxy: {
      '/api': { target: 'http://localhost:5321/api', changeOrigin: true }
    },
    prerender: {
      crawlLinks: false
    }
  },

  runtimeConfig: {
    // 从环境变量中读取API密钥
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,

    // 服务器端密钥
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,

    // 为客户端公开的部分配置
    public: {
      appVersion: '1.0.0'
    }
  },

  // AI模型配置
  ai: {
    openai: {
      dangerouslyAllowBrowser: true // 仅在开发时使用，生产环境应避免
    }
  },

  // 构建配置
  build: {
    transpile: ['pinia', '@pinia/nuxt']
  },

  // 禁用 SSR 以避免 Pinia 序列化问题
  ssr: false
})
