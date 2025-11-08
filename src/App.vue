<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'

// 初始化全局状态
const appStore = useAppStore()

onMounted(() => {
  // 初始化加载状态
  appStore.setLoading(true)

  // 模拟初始化加载（实际项目可替换为接口请求）
  setTimeout(() => {
    appStore.setLoading(false)
    appStore.showNotification('系统初始化完成', 'success')
  }, 1000)
})
</script>

<template>
  <div id="app">
    <!-- 全局加载遮罩 -->
    <el-loading v-if="appStore.appState.loading" target="#app" fullscreen text="系统初始化中..." />

    <!-- 全局通知 -->
    <el-notification
      v-model="appStore.appState.notification.visible"
      :type="appStore.appState.notification.type"
      :message="appStore.appState.notification.message"
      duration="3000"
    />

    <!-- 路由出口（所有页面通过路由渲染） -->
    <router-view />
  </div>
</template>

<style scoped>
#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #f5f5f5;
}
</style>
