<template>
  <div class="satellite-list">
    <!-- 筛选栏 -->
    <SatelliteFilter @filter-change="handleFilterChange" />

    <!-- 操作栏 -->
    <el-row :gutter="20" class="list-actions">
      <el-col :span="24" class="text-right">
        <el-button type="primary" @click="openAddForm">
          <el-icon><Plus /></el-icon> 新增卫星
        </el-button>
      </el-col>
    </el-row>

    <!-- 卫星表格 -->
    <el-table
      :data="filteredSatellites"
      border
      style="width: 100%; margin-top: 16px"
      empty-text="暂无卫星数据"
    >
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

      <el-table-column label="显示状态" width="120">
        <template #default="scope">
          <el-switch
            v-model="scope.row.isVisible"
            active-color="#10b981"
            inactive-color="#d1d5db"
            @change="handleToggleVisible(scope.row.baseData.id, $event)"
          />
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200">
        <template #default="scope">
          <SatelliteOperation
            :satellite="scope.row"
            @edit="openEditForm"
            @delete="handleDelete"
            @detail="openDetail"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-if="total > 0"
      class="mt-4"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      :page-sizes="[5, 10, 20]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 新增/编辑表单弹窗 -->
    <SatelliteForm
      v-model:visible="isFormOpen"
      :is-edit="isEditMode"
      :initial-data="formInitialData"
      @confirm="handleFormConfirm"
    />

    <!-- 详情弹窗 -->
    <SatelliteDetail v-model:visible="isDetailOpen" :satellite="selectedSatellite" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useSatelliteStore } from '@/stores/satelliteStore'
import { useGroupStore } from '@/stores/groupStore'
import SatelliteFilter from './SatelliteFilter.vue'
import SatelliteOperation from './SatelliteOperation.vue'
import SatelliteForm from './SatelliteForm.vue'
import SatelliteDetail from './SatelliteDetail.vue'

const satelliteStore = useSatelliteStore()
const groupStore = useGroupStore()

// 状态管理
const currentPage = ref(1)
const pageSize = ref(10)
const isFormOpen = ref(false)
const isEditMode = ref(false)
const formInitialData = ref<any>(null)
const isDetailOpen = ref(false)
const selectedSatellite = ref<any>(null)
const filterParams = ref({
  groupId: null as number | null,
  status: null as boolean | null,
})

// 加载数据
onMounted(() => {
  satelliteStore.fetchSatelliteList({ page: 1, size: 100 })
  groupStore.fetchGroupList({})
})

// 筛选后的卫星列表
const filteredSatellites = computed(() => {
  let result = [...satelliteStore.satelliteEntities]

  // 按分组筛选
  if (filterParams.value.groupId) {
    result = result.filter((sat) =>
      sat.baseData.groups.some((group: any) => group.id === filterParams.value.groupId),
    )
  }

  // 按显示状态筛选
  if (filterParams.value.status !== null) {
    result = result.filter((sat) => sat.isVisible === filterParams.value.status)
  }

  // 分页处理
  const startIndex = (currentPage.value - 1) * pageSize.value
  return result.slice(startIndex, startIndex + pageSize.value)
})

// 总条数
const total = computed(() => satelliteStore.satelliteEntities.length)

// 筛选条件变化
const handleFilterChange = (params: { groupId?: number | null; status?: boolean | null }) => {
  filterParams.value = { ...filterParams.value, ...params }
  currentPage.value = 1 // 筛选后重置到第一页
}

// 分页尺寸变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

// 页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 打开新增表单
const openAddForm = () => {
  isEditMode.value = false
  formInitialData.value = {
    name: '',
    tle1: '',
    tle2: '',
    groupIds: [],
  }
  isFormOpen.value = true
}

// 打开编辑表单
const openEditForm = (satellite: any) => {
  isEditMode.value = true
  formInitialData.value = {
    id: satellite.baseData.id,
    name: satellite.baseData.name,
    tle1: satellite.baseData.tle1 || '',
    tle2: satellite.baseData.tle2 || '',
    groupIds: satellite.baseData.groups.map((g: any) => g.id),
  }
  isFormOpen.value = true
}

// 表单确认提交
const handleFormConfirm = () => {
  isFormOpen.value = false
  formInitialData.value = null
}

// 打开详情
const openDetail = (satellite: any) => {
  selectedSatellite.value = satellite
  isDetailOpen.value = true
}

// 删除卫星
const handleDelete = (satelliteId: number) => {
  // 注意：satelliteStore中没有deleteSatellite方法
  console.warn('删除卫星功能尚未实现')
}

// 切换卫星显示状态
const handleToggleVisible = (satelliteId: number, isVisible: boolean) => {
  satelliteStore.toggleSatelliteVisibility(satelliteId, isVisible)
}
</script>

<style scoped>
.list-actions {
  margin: 16px 0;
}
</style>
