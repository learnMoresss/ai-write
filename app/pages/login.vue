<script setup lang="ts">
const login = async () => {
  localStorage.setItem('fake_token', 'dev-token')
  await navigateTo('/')
}

useSeoMeta({ title: '登录占位' })
</script>

<template>
  <div class="max-w-xl mx-auto rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-950">
    <h1 class="text-xl font-semibold">登录占位页</h1>
    <p class="text-sm text-slate-600 dark:text-slate-300 mt-2">当前为假登录流程，用于后续接入真实 Auth 的中间件占位。</p>
    <div class="mt-5">
      <UButton color="primary" @click="login">使用假 Token 登录</UButton>
    </div>
  </div>
</template>
