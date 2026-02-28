<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold text-primary-600">AI 小说创作平台</h1>
          <p class="text-gray-600 mt-2">登录以继续</p>
        </div>
      </template>

      <div class="space-y-4">
        <UButton
          to="/"
          color="primary"
          class="w-full"
          size="lg"
        >
          进入平台
        </UButton>

        <p class="text-center text-sm text-gray-600">
          开发环境 - 点击上方按钮进入
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: '登录 - AI 小说创作平台'
})
</script>
