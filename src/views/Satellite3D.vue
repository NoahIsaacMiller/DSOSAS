<template>
  <div class="satellite-3d-view">
    <div class="view-header">
      <h2>卫星 3D 可视化</h2>
    </div>
    <div class="scene-container">
      <ThreeEarth />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useSatelliteStore } from '@/stores/satelliteStore'
import { useGroupStore } from '@/stores/groupStore'
import ThreeEarth from '@/components/scene/ThreeEarth.vue'
import type { SatelliteEntity } from '@/types/core'

// 初始化 Store
const satelliteStore = useSatelliteStore()
const groupStore = useGroupStore()
const sceneRef = ref<HTMLDivElement | null>(null)

/**
 * 计算可见卫星数量
 * 逻辑：卫星实体可见 且 其所属分组中至少有一个在可见分组列表中
 */
// AbstractEarth组件会自动处理场景初始化和卫星加载

// 页面挂载时可以预加载一些基础数据
onMounted(() => {
  // 预加载卫星和分组数据
  satelliteStore.fetchSatelliteList({ page: 1, size: 100 })
  groupStore.fetchGroupList({})
})
</script>

<style scoped>
.scene-container {
  padding: 20px;
  max-width: 100vw;
  box-sizing: border-box;
}

.scene-view {
  width: 100%;
  height: 600px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin: 20px 0;
  background-color: #fafafa;
  overflow: hidden;
}

.control-panel {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 10px 0;
}

button {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #359e6d;
}

button:active {
  background-color: #2a8659;
}
</style>
