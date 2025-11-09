<template>
  <div class="scene-controls">
    <div class="control-group">
      <!-- 视角重置 -->
      <button class="control-btn" @click="resetView" title="重置视角">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>

      <!-- 旋转控制 -->
      <button
        class="control-btn"
        @click="toggleRotation"
        :title="isRotating ? '停止旋转' : '开始旋转'"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M23 4v6h-6" />
          <path d="M1 20v-6h6" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </button>

      <!-- 卫星高亮定位 -->
      <button
        class="control-btn"
        @click="focusSelectedSatellite"
        title="定位选中卫星"
        :disabled="!selectedSatellite"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, watch, onUnmounted, type Ref } from 'vue'
import * as Cesium from 'cesium'
import { useSatelliteStore } from '@/stores/satelliteStore'

// 注入 Cesium 实例
const viewerRef = inject<Ref<Cesium.Viewer | null>>('cesiumViewer')
const satelliteStore = useSatelliteStore()

// 控制状态
const isRotating = ref(false)
const selectedSatellite = ref<number | null>(null)
let rotationTimer: number | null = null

// 重置视角到地球全局
const resetView = () => {
  if (!viewerRef) return
  const viewer = viewerRef.value
  if (!viewer) return

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(105, 30, 15000000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-30),
      roll: 0,
    },
    duration: 2,
  })
}

// 切换场景自动旋转
const toggleRotation = () => {
  if (!viewerRef) return
  const viewer = viewerRef.value
  if (!viewer) return

  isRotating.value = !isRotating.value
  if (isRotating.value) {
    startRotation()
  } else {
    stopRotation()
  }
}

// 开始场景旋转
const startRotation = () => {
  if (!viewerRef) return
  const viewer = viewerRef.value
  if (!viewer) return

  stopRotation() // 确保先停止已有旋转
  rotationTimer = window.setInterval(() => {
    if (viewerRef) {
      const currentViewer = viewerRef.value
      if (currentViewer) {
        currentViewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, Cesium.Math.toRadians(0.1))
      }
    }
  }, 20)
}

// 停止场景旋转
const stopRotation = () => {
  if (rotationTimer) {
    window.clearInterval(rotationTimer)
    rotationTimer = null
  }
}

// 聚焦选中的卫星
const focusSelectedSatellite = () => {
  if (!viewerRef) return
  const viewer = viewerRef.value
  if (!viewer || !selectedSatellite.value) return

  const satelliteEntity = viewer.entities.getById(`satellite_${selectedSatellite.value}`)
  if (satelliteEntity && satelliteEntity.position) {
    // 使用当前时间获取卫星位置
    const currentTime = Cesium.JulianDate.now()
    const position = satelliteEntity.position.getValue(currentTime) as Cesium.Cartesian3
    
    if (position) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(105, 30, 15000000), // 使用默认位置作为后备
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-20),
          roll: 0,
        },
        duration: 1.5,
      })
    }
  }
}

// 监听选中卫星变化
watch(
  () => satelliteStore.selectedSatellite,
  (newSatellite) => {
    // 确保我们存储的是ID而不是整个卫星对象
    selectedSatellite.value = newSatellite ? typeof newSatellite === 'number' ? newSatellite : newSatellite.baseData?.id || null : null
  },
)

// 页面销毁时停止旋转
onUnmounted(() => {
  stopRotation()
})
</script>

<style scoped>
.scene-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  gap: 10px;
}

.control-group {
  display: flex;
  gap: 8px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 8px;
  border-radius: 8px;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.control-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
