<template>
  <div></div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, inject, watch, type Ref } from 'vue'
import * as Cesium from 'cesium'
import { useSatelliteStore } from '@/stores/satelliteStore'
import { SimplifiedOrbitPropagator } from '@/hooks/satellitePosition'

// 注入 Cesium 实例
const viewerRef = inject<Ref<Cesium.Viewer | null>>('cesiumViewer')
const satelliteStore = useSatelliteStore()

// 存储轨迹实体映射（卫星ID -> Cesium.Entity）
const trackEntities = ref<Record<number, Cesium.Entity>>({})
// 选中的卫星ID（用于高亮轨迹）
const selectedSatelliteId = ref<number | null>(null)

// 计算卫星轨迹点（基于TLE数据预测未来1小时轨迹）
const calculateTrackPoints = (tle1: string, tle2: string) => {
  const points: Cesium.Cartesian3[] = []
  const startTime = Cesium.JulianDate.now()
  const endTime = Cesium.JulianDate.addHours(startTime, 1, new Cesium.JulianDate())

  // 创建轨道传播器
  const propagator = new SimplifiedOrbitPropagator(tle1, tle2)

  // 计算轨迹点（每1分钟一个点）
  let currentTime = Cesium.JulianDate.clone(startTime)
  while (Cesium.JulianDate.compare(currentTime, endTime) <= 0) {
    // 计算相对于起始时间的秒数
    const timeInSeconds = Cesium.JulianDate.secondsDifference(currentTime, startTime)
    
    // 使用轨道传播器计算位置
    const position = propagator.calculatePosition(timeInSeconds)
    points.push(position)
    
    Cesium.JulianDate.addMinutes(currentTime, 1, currentTime)
  }

  return points
}

// 创建卫星轨迹
const createSatelliteTrack = (satelliteId: number | string, satelliteData: any) => {
  if (!viewerRef || !viewerRef.value || !satelliteData.tle1 || !satelliteData.tle2) return
  const viewer = viewerRef.value

  try {
    const trackPoints = calculateTrackPoints(satelliteData.tle1, satelliteData.tle2)
    if (trackPoints.length === 0) return

    // 创建轨迹线实体
    const trackEntity = viewer.entities.add({
      id: `track_${satelliteId}`,
      polyline: {
        positions: new Cesium.ConstantProperty(trackPoints),
        width: 2,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.3,
          color: Cesium.Color.fromCssColorString('#00ffff'),
        }),
        show: selectedSatelliteId.value === satelliteId, // 仅选中卫星显示轨迹
      },
    })

    trackEntities.value[Number(satelliteId)] = trackEntity
  } catch (error) {
    console.error(`创建卫星轨迹失败 (ID: ${satelliteId}):`, error)
  }
}

// 移除卫星轨迹
const removeSatelliteTrack = (satelliteId: number | string) => {
  if (!viewerRef) return
  const viewer = viewerRef.value
  const id = Number(satelliteId)
  const trackEntity = trackEntities.value[id]
  if (!viewer || !trackEntity) return

  viewer.entities.remove(trackEntity)
  delete trackEntities.value[id]
}

// 更新轨迹显示状态（选中卫星显示，其他隐藏）
const updateTrackVisibility = () => {
  Object.keys(trackEntities.value).forEach((satId) => {
    const trackEntity = trackEntities.value[Number(satId)]
    if (trackEntity) {
      trackEntity.show = Number(satId) === selectedSatelliteId.value
    }
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

// 监听选中实体变化，高亮对应卫星轨迹
watch(
  () => {
    if (!viewerRef) return undefined
    const viewer = viewerRef.value
    return viewer ? viewer.selectedEntity : undefined
  },
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
