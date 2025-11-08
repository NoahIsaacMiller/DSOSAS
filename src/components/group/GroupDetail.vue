<template>
  <el-dialog v-model="visible" title="分组详情" :width="800" :before-close="handleClose">
    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="基础信息" name="info">
        <el-descriptions column="1" border>
          <el-descriptions-item label="分组名称">
            {{ group.groupName }}
          </el-descriptions-item>
          <el-descriptions-item label="分组ID">
            {{ group.id }}
          </el-descriptions-item>
          <el-descriptions-item label="描述">
            {{ group.description || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="关联卫星数">
            {{ satelliteCount }}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <el-tab-pane label="关联卫星" name="satellites">
        <div class="satellite-list">
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

          <el-table :data="filteredSatellites" border style="width: 100%" empty-text="暂无关联卫星">
            <el-table-column prop="baseData.name" label="卫星名称" width="200" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button
                  size="small"
                  type="danger"
                  @click="removeSatellite(scope.row.baseData.id)"
                >
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="openSatelliteSelector">添加卫星</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { defineProps, defineEmits, useModel } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useGroupStore } from '@/stores/groupStore'
import { useSatelliteStore } from '@/stores/satelliteStore'
import SatelliteSelector from './SatelliteSelector.vue'

// Props
const props = defineProps({
  visible: { type: Boolean, default: false },
  group: {
    type: Object,
    required: true,
    default: () => ({}),
  },
})

// Emits
const emit = defineEmits(['update:visible'])
const visible = useModel(props, 'visible')

const groupStore = useGroupStore()
const satelliteStore = useSatelliteStore()

// 标签页激活状态
const activeTab = ref('info')
// 搜索关键词
const searchKeyword = ref('')

// 关联卫星列表
const satelliteList = computed(() => {
  return satelliteStore.satelliteEntities.filter((sat) =>
    sat.baseData.groups.some((g) => g.id === props.group.id),
  )
})

// 卫星数量
const satelliteCount = computed(() => satelliteList.value.length)

// 筛选后的卫星列表
const filteredSatellites = computed(() => {
  if (!searchKeyword.value) return satelliteList.value
  return satelliteList.value.filter((sat) => sat.baseData.name.includes(searchKeyword.value))
})

// 搜索卫星
const handleSearch = () => {
  // 触发搜索（实际项目中可结合接口）
}

// 移除卫星
const removeSatellite = (satelliteId: number) => {
  groupStore.removeSatelliteFromGroup(props.group.id, satelliteId)
}

// 打开卫星选择器
const openSatelliteSelector = () => {
  new SatelliteSelector({
    groupId: props.group.id,
    onConfirm: (selectedSatellites: any[]) => {
      groupStore.associateSatellites(props.group.id, selectedSatellites)
    },
  })
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.satellite-list {
  margin-top: 16px;
}
</style>
