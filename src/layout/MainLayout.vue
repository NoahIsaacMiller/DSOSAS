<template>
  <div class="main-layout">
    <!-- 顶部栏 -->
    <Header class="header" />

    <div class="main-content">
      <!-- 左侧侧边栏 -->
      <Sidebar class="sidebar" />

      <!-- 主场景区域（3D可视化） -->
      <div class="scene-area">
        <Satellite3D />
      </div>

      <!-- 右侧控制面板 -->
      <RightPanel class="right-panel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import RightPanel from '@/components/layout/RightPanel.vue'
import Satellite3D from '@/views/Satellite3D.vue'
</script>

<style scoped>
.main-layout {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 60px;
  border-bottom: 1px solid #e0e0e0;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.scene-area {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.right-panel {
  width: 260px;
  border-left: 1px solid #e0e0e0;
  background-color: #fff;
}
</style>
