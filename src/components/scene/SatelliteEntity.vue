<template>
  <div></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, inject, watch, type Ref } from 'vue'
import * as Cesium from 'cesium'
import { useSatelliteStore } from '@/stores/satelliteStore'
import { useGroupStore } from '@/stores/groupStore'
import { SimplifiedOrbitPropagator } from '@/hooks/satellitePosition'

// 注入 Cesium 实例
const viewerRef = inject<Ref<Cesium.Viewer | null>>('cesiumViewer')
const satelliteStore = useSatelliteStore()
const groupStore = useGroupStore()

// 存储卫星实体映射（卫星ID -> Cesium.Entity）
const satelliteEntities = ref<Record<number, Cesium.Entity>>({})

// 从 TLE 数据创建卫星实体
const createSatelliteEntity = (satellite: any) => {
  if (!viewerRef) return
  const viewer = viewerRef.value
  if (!viewer || !satellite.tle1 || !satellite.tle2) return

  try {
    // 创建卫星点实体
    const entity = viewer.entities.add({
      id: `satellite_${satellite.id}`,
      name: satellite.name,
      // 位置将在下方设置
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
          // 使用不同的属性名设置颜色
          fillColor: Cesium.Color.WHITE,
          pixelOffset: new Cesium.Cartesian2(0, 10),
          show: true,
        },
        // 存储原始数据
        properties: {
          satelliteData: satellite
        },
    })

    // 使用TLE数据创建采样位置属性
    const sampledPositionProperty = new Cesium.SampledPositionProperty()
    
    // 创建轨道传播器
    const propagator = new SimplifiedOrbitPropagator(satellite.tle1, satellite.tle2)
    
    // 添加采样点（未来24小时，每5分钟一个点）
    const startTime = Cesium.JulianDate.now()
    const endTime = Cesium.JulianDate.addDays(startTime, 1, new Cesium.JulianDate())
    
    let currentTime = Cesium.JulianDate.clone(startTime)
    while (Cesium.JulianDate.compare(currentTime, endTime) < 0) {
      // 计算相对于起始时间的秒数
      const timeInSeconds = Cesium.JulianDate.secondsDifference(currentTime, startTime)
      
      // 使用轨道传播器计算位置
      const position = propagator.calculatePosition(timeInSeconds)
      
      // 添加采样点
      sampledPositionProperty.addSample(currentTime, position)
      
      // 前进5分钟
      Cesium.JulianDate.addMinutes(currentTime, 5, currentTime)
    }
    
    // 设置实体位置和朝向
    entity.position = sampledPositionProperty
    entity.orientation = new Cesium.VelocityOrientationProperty(sampledPositionProperty)

    satelliteEntities.value[Number(satellite.id)] = entity
  } catch (error) {
    console.error(`创建卫星实体失败 (ID: ${satellite.id}):`, error)
  }
}

// 移除卫星实体
const removeSatelliteEntity = (satelliteId: number | string) => {
  if (!viewerRef) return
  const viewer = viewerRef.value
  const id = Number(satelliteId)
  const entity = satelliteEntities.value[id]
  if (!viewer || !entity) return

  viewer.entities.remove(entity)
  delete satelliteEntities.value[id]
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
