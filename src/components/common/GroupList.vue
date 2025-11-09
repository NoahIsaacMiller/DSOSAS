<template>
  <div class="group-list">
    <!-- 操作栏 -->
    <el-row :gutter="20" class="list-actions">
      <el-col :span="24" class="text-right">
        <el-button type="primary" @click="openAddForm">
          <el-icon><Plus /></el-icon> 新增分组
        </el-button>
      </el-col>
    </el-row>

    <!-- 分组表格 -->
    <el-table
      :data="groupList"
      border
      style="width: 100%; margin-top: 16px"
      empty-text="暂无分组数据"
    >
      <el-table-column prop="groupName" label="分组名称" width="200" />
      <el-table-column prop="description" label="描述" width="300" />
      <el-table-column label="关联卫星数" width="120">
        <template #default="scope">
          {{ getSatelliteCount(scope.row.id) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280">
        <template #default="scope">
          <GroupOperation
            :group="scope.row"
            @edit="openEditForm"
            @delete="handleDelete"
            @detail="openDetail"
            @highlight="handleHighlight"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑表单弹窗 -->
    <GroupForm
      v-model:visible="isFormOpen"
      :is-edit="isEditMode"
      :initial-data="formInitialData"
      @confirm="handleFormConfirm"
    />

    <!-- 详情弹窗 -->
    <GroupDetail v-model:visible="isDetailOpen" :group="selectedGroup" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useGroupStore } from '@/stores/groupStore'
import { useSatelliteStore } from '@/stores/satelliteStore'
import GroupOperation from './GroupOperation.vue'
import GroupForm from './GroupForm.vue'
import GroupDetail from './GroupDetail.vue'

const groupStore = useGroupStore()
const satelliteStore = useSatelliteStore()

// 状态管理
const isFormOpen = ref(false)
const isEditMode = ref(false)
const formInitialData = ref<any>(null)
const isDetailOpen = ref(false)
const selectedGroup = ref<any>(null)

// 分组列表
const groupList = computed(() => groupStore.groupList)

// 获取分组关联卫星数
const getSatelliteCount = (groupId: number) => {
  return satelliteStore.satelliteEntities.filter((sat) =>
    sat.baseData.groups.some((g) => g.id === groupId),
  ).length
}

// 打开新增表单
const openAddForm = () => {
  isEditMode.value = false
  formInitialData.value = { groupName: '', description: '' }
  isFormOpen.value = true
}

// 打开编辑表单
const openEditForm = (group: any) => {
  isEditMode.value = true
  formInitialData.value = { ...group }
  isFormOpen.value = true
}

// 表单确认提交
const handleFormConfirm = () => {
  isFormOpen.value = false
  formInitialData.value = null
}

// 打开详情
const openDetail = (group: any) => {
  selectedGroup.value = group
  isDetailOpen.value = true
}

// 删除分组
const handleDelete = (groupId: number) => {
  if (confirm('确定要删除该分组吗？')) {
    // 注意：groupStore中没有deleteGroup方法
    console.warn('删除分组功能尚未实现')
  }
}

// 高亮分组（在3D场景中突出显示）
const handleHighlight = (groupId: number) => {
  // 注意：groupStore中没有setHighlightGroupId方法
  console.warn('高亮分组功能尚未实现')
}
</script>
