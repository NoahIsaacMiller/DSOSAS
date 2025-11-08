<template>
  <div class="scene-container">
    <h1>卫星 3D 可视化</h1>
    <div class="scene-view" ref="sceneRef"></div>
    <div class="control-panel">
      <p>当前显示卫星数: {{ visibleSatelliteCount }}</p>
      <button @click="refreshScene">刷新场景</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSatelliteStore } from '@/stores/satelliteStore'
import { useGroupStore } from '@/stores/groupStore'
import type { SatelliteEntity } from '@/types/core' // 导入卫星实体类型

// 初始化 Store
const satelliteStore = useSatelliteStore()
const groupStore = useGroupStore()
const sceneRef = ref<HTMLDivElement | null>(null)

/**
 * 计算可见卫星数量
 * 逻辑：卫星实体可见 且 其所属分组中至少有一个在可见分组列表中
 */
const visibleSatelliteCount = computed(() => {
  const visibleGroupIds = groupStore.visibleGroupIds

  return satelliteStore.satelliteEntities.filter((entity: SatelliteEntity) => {
    // 1. 卫星实体本身不可见，直接排除
    if (!entity.isVisible) return false

    // 2. 提取卫星所属的所有分组ID（从 groups 数组中）
    const satelliteGroupIds = entity.baseData.groups.map((group) => group.id)

    // 3. 检查是否有至少一个分组在可见列表中
    return satelliteGroupIds.some((groupId) => visibleGroupIds.has(groupId))
  }).length
})

/**
 * 初始化3D场景
 */
const initScene = () => {
  if (sceneRef.value) {
    sceneRef.value.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #666;">
        3D场景容器（可对接Three.js/Cesium）
      </div>
    `
  }
}

/**
 * 刷新场景（同步卫星和分组的显示状态）
 */
const refreshScene = () => {
  if (!sceneRef.value) return

  // 筛选出需要显示的卫星实体
  const visibleEntities = satelliteStore.satelliteEntities.filter((entity: SatelliteEntity) => {
    if (!entity.isVisible) return false
    const satelliteGroupIds = entity.baseData.groups.map((group) => group.id)
    return satelliteGroupIds.some((groupId) => groupStore.visibleGroupIds.has(groupId))
  })

  // 这里可添加实际3D渲染逻辑（示例：更新场景提示文本）
  sceneRef.value.innerHTML = `
    <div style="width: 100%; height: 100%; padding: 20px; color: #333;">
      <p>3D场景已刷新</p>
      <p>当前显示卫星：${visibleEntities.length} 颗</p>
      <p>卫星ID列表：${visibleEntities.map((e) => e.baseData.id).join(', ') || '无'}</p>
    </div>
  `
}

/**
 * 监听卫星或分组状态变化，自动刷新场景
 */
watch(
  [() => satelliteStore.satelliteEntities, () => groupStore.visibleGroupIds],
  () => {
    refreshScene()
  },
  { deep: true }, // 深度监听对象/数组变化
)

/**
 * 页面挂载时初始化
 */
onMounted(() => {
  initScene()
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
