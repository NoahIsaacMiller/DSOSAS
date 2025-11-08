<template>
  <div></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, inject, watch } from 'vue'
import * as Cesium from 'cesium'
import { useSatelliteStore } from '@/stores/satelliteStore'
import { useGroupStore } from '@/stores/groupStore'

// 注入 Cesium 实例
const viewerRef = inject<Ref<Cesium.Viewer | null>>('cesiumViewer')
const satelliteStore = useSatelliteStore()
const groupStore = useGroupStore()

// 存储卫星实体映射（卫星ID -> Cesium.Entity）
const satelliteEntities = ref<Record<number, Cesium.Entity>>({})

// 从 TLE 数据创建卫星实体
const createSatelliteEntity = (satellite: any) => {
  if (!viewerRef.value || !satellite.tle1 || !satellite.tle2) return

  // 解析 TLE 数据
  const tleData = {
    tle1: satellite.tle1,
    tle2: satellite.tle2,
    name: satellite.name,
  }

  // 创建卫星点实体
  const entity = viewerRef.value.entities.add({
    id: `satellite_${satellite.id}`,
    name: satellite.name,
    position: Cesium.Cartesian3.fromDegrees(0, 0), // 初始位置，后续通过 TLE 更新
    point: {
      pixelSize: 6,
      color: Cesium.Color.fromCssColorString('#42b983'),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 1,
      show: true,
    },
    label: {
      text: satellite.name,
      font: '12px sans-serif',
      color: Cesium.Color.WHITE,
      pixelOffset: new Cesium.Cartesian2(0, 10),
      show: true,
    },
  })

  // 使用 TLE 驱动卫星位置更新
  const satellitePositionProperty = new Cesium.SatellitePositionProperty(tleData)
  entity.position = satellitePositionProperty
  entity.orientation = new Cesium.VelocityOrientationProperty(satellitePositionProperty)

  satelliteEntities.value[satellite.id] = entity
}

// 移除卫星实体
const removeSatelliteEntity = (satelliteId: number) => {
  if (!viewerRef.value || !satelliteEntities.value[satelliteId]) return

  viewerRef.value.entities.remove(satelliteEntities.value[satelliteId])
  delete satelliteEntities.value[satelliteId]
}

// 更新卫星显示状态（基于卫星自身可见性和分组可见性）
const updateSatelliteVisibility = (satelliteId: number) => {
  const entity = satelliteEntities.value[satelliteId]
  if (!entity) return

  const satellite = satelliteStore.satelliteEntities.find((s) => s.baseData.id === satelliteId)
  if (!satellite) return

  // 检查所属分组是否可见
  const satelliteGroupIds = satellite.baseData.groups.map((g) => g.id)
  const isGroupVisible = satelliteGroupIds.some((gid) => groupStore.visibleGroupIds.has(gid))

  entity.show = satellite.isVisible && isGroupVisible
}

// 监听卫星列表变化，同步实体
watch(
  () => satelliteStore.satelliteEntities,
  (newSatellites, oldSatellites) => {
    // 新增卫星
    newSatellites.forEach((sat) => {
      if (!oldSatellites.some((o) => o.baseData.id === sat.baseData.id)) {
        createSatelliteEntity(sat.baseData)
      }
    })

    // 移除卫星
    oldSatellites.forEach((oldSat) => {
      if (!newSatellites.some((n) => n.baseData.id === oldSat.baseData.id)) {
        removeSatelliteEntity(oldSat.baseData.id)
      }
    })

    // 更新所有卫星可见性
    newSatellites.forEach((sat) => {
      updateSatelliteVisibility(sat.baseData.id)
    })
  },
  { deep: true },
)

// 监听分组可见性变化，更新卫星显示
watch(
  () => groupStore.visibleGroupIds,
  () => {
    Object.keys(satelliteEntities.value).forEach((satId) => {
      updateSatelliteVisibility(Number(satId))
    })
  },
  { deep: true },
)

// 初始化创建已有卫星
onMounted(() => {
  satelliteStore.satelliteEntities.forEach((sat) => {
    createSatelliteEntity(sat.baseData)
  })
})

// 销毁时移除所有卫星实体
onUnmounted(() => {
  Object.keys(satelliteEntities.value).forEach((satId) => {
    removeSatelliteEntity(Number(satId))
  })
})
</script>
