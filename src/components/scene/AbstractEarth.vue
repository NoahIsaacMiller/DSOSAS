<template>
  <div class="abstract-earth">
    <div id="cesiumContainer" class="cesium-container"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, provide } from 'vue'
import * as Cesium from 'cesium'

// 提供 Cesium 实例给子组件
const viewerRef = ref<Cesium.Viewer | null>(null)
provide('cesiumViewer', viewerRef)

// 初始化 Cesium 场景
const initCesium = () => {
  // 配置 Cesium 访问令牌（需替换为你的有效令牌，从 Cesium 官网申请）
  Cesium.Ion.defaultAccessToken = '你的 Cesium Ion 令牌'

  const container = document.getElementById('cesiumContainer')
  if (!container) return

  // 创建黑客风格无实景地球
  const viewer = new Cesium.Viewer(container, {
    // 隐藏默认控件
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,

    // 禁用地形和影像图层（纯网格地球）
    terrainProvider: new Cesium.EllipsoidTerrainProvider(),
    imageryProvider: false,

    // 配置场景参数
    scene: {
      backgroundColor: Cesium.Color.BLACK,
      backgroundAlpha: 1,
      fog: {
        enabled: false,
      },
    },
  })

  // 设置黑客风格网格
  viewer.scene.globe.show = true
  viewer.scene.globe.material = Cesium.Material.fromType('Grid', {
    color: new Cesium.Color(0.1, 0.8, 0.2, 0.8),
    cellAlpha: 0.1,
    lineCount: new Cesium.Cartesian2(80, 40),
    lineThickness: new Cesium.Cartesian2(1.0, 1.0),
  })

  // 隐藏 Cesium 版权信息
  viewer.cesiumWidget.creditContainer.style.display = 'none'

  // 设置初始视角（对准地球）
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(105, 30, 15000000),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-30),
      roll: 0,
    },
  })

  viewerRef.value = viewer
}

// 销毁场景
const destroyCesium = () => {
  if (viewerRef.value) {
    viewerRef.value.destroy()
    viewerRef.value = null
  }
}

onMounted(() => {
  initCesium()
})

onUnmounted(() => {
  destroyCesium()
})
</script>

<style scoped>
.abstract-earth {
  width: 100%;
  height: 100%;
}

.cesium-container {
  width: 100%;
  height: 100%;
}
</style>
