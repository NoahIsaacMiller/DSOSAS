<template>
  <div class="group-checkbox-list">
    <div class="list-header">
      <h3>分组显示控制</h3>
      <div class="list-actions">
        <el-button size="small" @click="selectAll"> 全选 </el-button>
        <el-button size="small" @click="deselectAll"> 取消全选 </el-button>
      </div>
    </div>

    <el-checkbox-group v-model="checkedGroupIds">
      <el-checkbox v-for="group in groupList" :key="group.id" :label="group.id" class="mb-2">
        <span class="group-name">{{ group.groupName }}</span>
        <span class="satellite-count ml-2"> ({{ getSatelliteCount(group.id) }}) </span>
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { defineEmits } from 'vue'
import { useGroupStore } from '@/stores/groupStore'
import { useSatelliteStore } from '@/stores/satelliteStore'

// Emits
const emit = defineEmits(['update:checkedGroupIds'])

const groupStore = useGroupStore()
const satelliteStore = useSatelliteStore()

// 选中的分组ID
const checkedGroupIds = ref<number[]>([])

// 分组列表
const groupList = computed(() => groupStore.groupList)

// 监听分组可见性变化，同步选中状态
watch(
  () => groupStore.visibleGroupIds,
  (newIds) => {
    checkedGroupIds.value = newIds
  },
  { immediate: true, deep: true },
)

// 监听选中状态变化，同步分组可见性
watch(
  checkedGroupIds,
  (newIds) => {
    groupStore.setGroupVisibility(newIds)
    emit('update:checkedGroupIds', newIds)
  },
  { deep: true },
)

// 获取分组关联卫星数
const getSatelliteCount = (groupId: number) => {
  return satelliteStore.satelliteEntities.filter((sat) =>
    sat.baseData.groups.some((g) => g.id === groupId),
  ).length
}

// 全选
const selectAll = () => {
  checkedGroupIds.value = groupList.value.map((g) => g.id)
}

// 取消全选
const deselectAll = () => {
  checkedGroupIds.value = []
}
</script>

<style scoped>
.group-checkbox-list {
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-header h3 {
  font-size: 16px;
  margin: 0;
}

.list-actions {
  display: flex;
  gap: 8px;
}

.group-name {
  font-weight: 500;
}

.satellite-count {
  color: #666;
  font-size: 13px;
}
</style>
