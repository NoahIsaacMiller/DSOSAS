<template>
  <el-dialog v-model="visible" title="选择卫星" :width="800" :before-close="handleClose">
    <el-input
      v-model="searchKeyword"
      placeholder="搜索卫星名称"
      clearable
      style="width: 200px; margin-bottom: 16px"
      @keyup.enter="handleSearch"
    >
      <template #append>
        <el-button icon="Search" @click="handleSearch" />
      </template>
    </el-input>

    <el-table :data="filteredSatellites" border style="width: 100%" empty-text="暂无卫星数据">
      <el-table-column prop="baseData.name" label="卫星名称" width="200" />
      <el-table-column label="分组" width="300">
        <template #default="scope">
          <el-tag
            v-for="group in scope.row.baseData.groups"
            :key="group.id"
            size="small"
            effect="light"
            class="mr-2"
          >
            {{ group.groupName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="scope">
          <el-checkbox
            v-model="selectedSatellites"
            :label="scope.row"
            :disabled="isSatelliteInGroup(scope.row.baseData.id)"
          />
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useSatelliteStore } from '@/stores/satelliteStore'

const satelliteStore = useSatelliteStore()

// 弹窗可见性
const visible = ref(false)
// 搜索关键词
const searchKeyword = ref('')
// 选中的卫星
const selectedSatellites = ref<any[]>([])
// 目标分组ID
const groupId = ref<number | null>(null)
// 确认回调
const confirmCallback = ref<((selected: any[]) => void) | null>(null)

// 所有卫星列表
const satelliteList = computed(() => satelliteStore.satelliteEntities)

// 筛选后的卫星列表
const filteredSatellites = computed(() => {
  if (!searchKeyword.value) return satelliteList.value
  return satelliteList.value.filter((sat) => sat.baseData.name.includes(searchKeyword.value))
})

// 检查卫星是否已在分组中
const isSatelliteInGroup = (satelliteId: number) => {
  if (!groupId.value) return false
  return satelliteList.value.some(
    (sat) =>
      sat.baseData.id === satelliteId && sat.baseData.groups.some((g) => g.id === groupId.value),
  )
}

// 搜索卫星
const handleSearch = () => {
  // 触发搜索（实际项目中可结合接口）
}

// 确认选择
const handleConfirm = () => {
  if (confirmCallback.value) {
    confirmCallback.value(selectedSatellites.value)
  }
  handleClose()
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  searchKeyword.value = ''
  selectedSatellites.value = []
  groupId.value = null
  confirmCallback.value = null
}

// 暴露给外部的调用方法
const openSelector = (options: { groupId: number; onConfirm: (selected: any[]) => void }) => {
  groupId.value = options.groupId
  confirmCallback.value = options.onConfirm
  visible.value = true
}

defineExpose({ openSelector })
</script>
