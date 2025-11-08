<template>
  <div></div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, inject, watch } from 'vue'
import * as Cesium from 'cesium'
import { useSatelliteStore } from '@/stores/satelliteStore'

// 注入 Cesium 实例
const viewerRef = inject<Ref<Cesium.Viewer | null>>('cesiumViewer')
const satelliteStore = useSatelliteStore()

// 存储轨迹实体映射（卫星ID -> Cesium.Entity）
const trackEntities = ref<Record<number, Cesium.Entity>>({})
// 选中的卫星ID（用于高亮轨迹）
const selectedSatelliteId = ref<number | null>(null)

// 计算卫星轨迹点（基于 TLE 预测未来1小时轨迹）
const calculateTrackPoints = (tle1: string, tle2: string) => {
  const points = []
  const startTime = Cesium.JulianDate.now()
  const endTime = Cesium.JulianDate.addHours(startTime, 1, new Cesium.JulianDate())
  const step = Cesium.JulianDate.addMinutes(startTime, 1, new Cesium.JulianDate())

  const satellitePositionProperty = new Cesium.SatellitePositionProperty({ tle1, tle2 })

  let currentTime = startTime.clone()
  while (Cesium.JulianDate.compare(currentTime, endTime) <= 0) {
    const position = satellitePositionProperty.getValue(currentTime)
    if (position) {
      points.push(position)
    }
    Cesium.JulianDate.addMinutes(currentTime, 1, currentTime)
  }

  return points
}

// 创建卫星轨迹
const createSatelliteTrack = (satelliteId: number, satelliteData: any) => {
  if (!viewerRef.value || !satelliteData.tle1 || !satelliteData.tle2) return

  const trackPoints = calculateTrackPoints(satelliteData.tle1, satelliteData.tle2)
  if (trackPoints.length === 0) return

  // 创建轨迹线实体
  const trackEntity = viewerRef.value.entities.add({
    id: `track_${satelliteId}`,
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights([]),
      width: 2,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.3,
        color: Cesium.Color.fromCssColorString('#00ffff'),
      }),
      show: selectedSatelliteId.value === satelliteId, // 仅选中卫星显示轨迹
    },
  })

  // 设置轨迹点
  trackEntity.polyline.positions = new Cesium.ConstantPositionProperty(trackPoints)
  trackEntities.value[satelliteId] = trackEntity
}

// 移除卫星轨迹
const removeSatelliteTrack = (satelliteId: number) => {
  if (!viewerRef.value || !trackEntities.value[satelliteId]) return

  viewerRef.value.entities.remove(trackEntities.value[satelliteId])
  delete trackEntities.value[satelliteId]
}

// 更新轨迹显示状态（选中卫星显示，其他隐藏）
const updateTrackVisibility = () => {
  Object.keys(trackEntities.value).forEach((satId) => {
    const trackEntity = trackEntities.value[Number(satId)]
    trackEntity.show = Number(satId) === selectedSatelliteId.value
  })
}

// 监听卫星列表变化，同步轨迹
watch(
  () => satelliteStore.satelliteEntities,
  (newSatellites, oldSatellites) => {
    // 新增卫星轨迹
    newSatellites.forEach((sat) => {
      const satId = sat.baseData.id
      if (!oldSatellites.some((o) => o.baseData.id === satId)) {
        createSatelliteTrack(satId, sat.baseData)
      }
    })

    // 移除卫星轨迹
    oldSatellites.forEach((oldSat) => {
      const satId = oldSat.baseData.id
      if (!newSatellites.some((n) => n.baseData.id === satId)) {
        removeSatelliteTrack(satId)
      }
    })
  },
  { deep: true },
)

// 监听选中卫星变化，更新轨迹显示
watch(selectedSatelliteId, () => {
  updateTrackVisibility()
})

// 监听卫星实体选中事件（从 Cesium 场景中）
watch(
  () => viewerRef.value?.selectedEntity,
  (selectedEntity) => {
    if (!selectedEntity) {
      selectedSatelliteId.value = null
      return
    }

    // 解析选中的卫星ID
    if (selectedEntity.id?.toString().startsWith('satellite_')) {
      const satId = Number(selectedEntity.id.toString().replace('satellite_', ''))
      selectedSatelliteId.value = satId
    }
  },
)

// 销毁时移除所有轨迹
onUnmounted(() => {
  Object.keys(trackEntities.value).forEach((satId) => {
    removeSatelliteTrack(Number(satId))
  })
})
</script>
