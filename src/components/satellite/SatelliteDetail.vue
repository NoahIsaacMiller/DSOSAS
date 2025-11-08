<template>
  <el-dialog v-model="visible" title="卫星详情" :width="500" :before-close="handleClose">
    <el-descriptions column="1" border>
      <!-- 基础信息 -->
      <el-descriptions-item label="卫星名称">
        {{ satellite.baseData.name }}
      </el-descriptions-item>
      <el-descriptions-item label="卫星ID">
        {{ satellite.baseData.id }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ formatDate(satellite.baseData.createAt) }}
      </el-descriptions-item>
      <el-descriptions-item label="更新时间">
        {{ formatDate(satellite.baseData.updateAt) }}
      </el-descriptions-item>

      <!-- 关联分组 -->
      <el-descriptions-item label="关联分组">
        <el-tag
          v-for="group in satellite.baseData.groups"
          :key="group.id"
          size="small"
          effect="light"
          class="mr-2"
        >
          {{ group.groupName }}
        </el-tag>
      </el-descriptions-item>

      <!-- TLE 数据 -->
      <el-descriptions-item label="TLE 数据">
        <el-input v-model="tleText" type="textarea" :rows="2" readonly class="mt-2" />
        <div class="mt-2">
          <el-button size="small" type="primary" @click="copyTle" class="mr-2">
            <el-icon><CopyDocument /></el-icon> 复制
          </el-button>
          <el-button size="small" type="success" @click="exportTle">
            <el-icon><Download /></el-icon> 导出
          </el-button>
        </div>
      </el-descriptions-item>

      <!-- 轨迹控制 -->
      <el-descriptions-item label="轨迹显示">
        <el-switch
          v-model="showTrack"
          active-color="#10b981"
          inactive-color="#d1d5db"
          @change="handleTrackToggle"
        />
        <el-tooltip content="开启后在3D场景中显示轨道轨迹（持续1小时）">
          <el-icon size="16" class="ml-2"><InfoFilled /></el-icon>
        </el-tooltip>
      </el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { defineProps, defineEmits, useModel } from 'vue'
import { CopyDocument, Download, InfoFilled } from '@element-plus/icons-vue'
import { useSatelliteStore } from '@/stores/satelliteStore'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  visible: { type: Boolean, default: false },
  satellite: {
    type: Object,
    required: true,
    default: () => ({ baseData: {} }),
  },
})

// Emits
const emit = defineEmits(['update:visible'])
const visible = useModel(props, 'visible')

const satelliteStore = useSatelliteStore()
const showTrack = ref(true) // 默认显示轨迹

// 合并TLE文本
const tleText = computed(() => {
  return `${props.satellite.baseData.tle1 || ''}\n${props.satellite.baseData.tle2 || ''}`
})

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 复制TLE数据
const copyTle = () => {
  navigator.clipboard
    .writeText(tleText.value)
    .then(() => {
      ElMessage.success('TLE数据复制成功')
    })
    .catch(() => {
      ElMessage.error('TLE数据复制失败，请手动复制')
    })
}

// 导出TLE数据
const exportTle = () => {
  const blob = new Blob([tleText.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.satellite.baseData.name || 'satellite'}_tle.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('TLE数据导出成功')
}

// 切换轨迹显示
const handleTrackToggle = (value: boolean) => {
  satelliteStore.toggleSatelliteVisibility(props.satellite.baseData.id, value)
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}
</script>
