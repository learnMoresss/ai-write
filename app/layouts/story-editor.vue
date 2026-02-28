<template>
  <div class="story-editor-layout">
    <UContainer>
      <div class="layout-content">
        <slot />
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
// 故事编辑器布局组件
</script>

<style scoped>
.story-editor-layout {
  min-height: 100vh;
  background-color: #f8fafc;
}

.layout-content {
  padding-top: 1rem;
  padding-bottom: 2rem;
}
</style>