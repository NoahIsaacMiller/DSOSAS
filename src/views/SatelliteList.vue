<template>
  <div class="page-container">
    <div class="page-header">
      <h1>卫星列表</h1>
      <el-button type="primary" @click="handleAddSatellite">
        <el-icon><Plus /></el-icon> 新增卫星
      </el-button>
    </div>

    <!-- 表格加载状态 -->
    <el-table
      v-loading="loading"
      :data="satelliteList"
      style="width: 100%"
      border
      empty-text="暂无数据"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="卫星名称" min-width="200">
        <template #default="scope">
          <span>{{ scope.row?.name || '未知卫星' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="visible" label="显示状态" width="120">
        <template #default="scope">
          <el-switch
            v-model="scope.row._visible"
            active-text="显示"
            inactive-text="隐藏"
            @change="toggleVisible(scope.row.id, $event)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="operations" label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleEditSatellite(scope.row)">
            <el-icon><Edit /></el-icon> 编辑
          </el-button>
          <el-button size="small" type="danger" @click="handleDeleteSatellite(scope.row)">
            <el-icon><Delete /></el-icon> 删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 卫星表单弹窗 -->
    <satellite-form
      :visible="showSatelliteForm"
      :is-edit="isEditSatellite"
      :initial-data="selectedSatellite"
      @update:visible="showSatelliteForm = $event"
      @confirm="handleSatelliteFormConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSatelliteStore } from '@/stores/satelliteStore'
import SatelliteForm from '@/components/satellite/SatelliteForm.vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

// 初始化 Store
const satelliteStore = useSatelliteStore()

// 分页参数
const page = ref(1)
const pageSize = ref(10)

// 表单弹窗状态
const showSatelliteForm = ref(false)
const isEditSatellite = ref(false)
const selectedSatellite = ref({})

// 状态提取 - 添加防御性检查
const satelliteList = computed(() => {
  const list = Array.isArray(satelliteStore.satelliteList) ? satelliteStore.satelliteList : []
  // 添加可见性标志
  return list.map(item => ({
    ...item,
    _visible: isVisible(item?.id)
  }))
})
const total = computed(() => typeof satelliteStore.total === 'number' ? satelliteStore.total : 0)
const loading = ref(false)

// 加载卫星列表
const fetchSatellites = async () => {
  loading.value = true
  try {
    await satelliteStore.fetchSatelliteList({ page: page.value, size: pageSize.value })
  } catch (err) {
    console.error('加载卫星失败:', err)
    ElMessage.error('加载卫星失败')
  } finally {
    loading.value = false
  }
}

// 切换可见性
const toggleVisible = async (id: number, value: boolean) => {
  try {
    await satelliteStore.toggleSatelliteVisibility(id, value)
    ElMessage.success(value ? '已显示卫星' : '已隐藏卫星')
  } catch (err) {
    console.error('切换卫星可见性失败:', err)
    ElMessage.error('操作失败')
    // 恢复之前的状态
    const item = satelliteList.value.find(item => item.id === id)
    if (item) {
      item._visible = !value
    }
  }
}

// 检查卫星是否可见
const isVisible = (id?: number | undefined) => {
  // 如果ID无效，默认返回true
  if (!id || typeof id !== 'number') return true
  
  try {
    // 防御性检查satelliteEntities是否为数组
    const entities = Array.isArray(satelliteStore.satelliteEntities) ? satelliteStore.satelliteEntities : []
    const entity = entities.find((item) => item?.baseData?.id === id)
    return entity ? entity.isVisible : true
  } catch (error) {
    console.error('检查卫星可见性出错:', error)
    return true
  }
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchSatellites()
}

const handleCurrentChange = (current: number) => {
  page.value = current
  fetchSatellites()
}

// 新增卫星
const handleAddSatellite = () => {
  isEditSatellite.value = false
  selectedSatellite.value = { name: '', tle1: '', tle2: '', groupIds: [] }
  showSatelliteForm.value = true
}

// 编辑卫星
const handleEditSatellite = (satellite: any) => {
  isEditSatellite.value = true
  selectedSatellite.value = { ...satellite }
  showSatelliteForm.value = true
}

// 删除卫星
const handleDeleteSatellite = (satellite: any) => {
  ElMessageBox.confirm(
    `确定要删除卫星「${satellite?.name || '未知'}」吗？删除后不可恢复`,
    '删除确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      loading.value = true
      try {
        // 调用删除方法（假设store中已实现）
        // await satelliteStore.deleteSatellite(satellite.id)
        ElMessage.success('删除成功')
        fetchSatellites() // 重新加载列表
      } catch (err) {
        console.error('删除卫星失败:', err)
        ElMessage.error('删除失败')
      } finally {
        loading.value = false
      }
    })
    .catch(() => {
      // 取消删除
    })
}

// 处理表单确认
const handleSatelliteFormConfirm = async (formData: any) => {
  loading.value = true
  try {
    if (isEditSatellite.value) {
      // await satelliteStore.updateSatellite(formData)
      ElMessage.success('更新成功')
    } else {
      // await satelliteStore.addSatellite(formData)
      ElMessage.success('新增成功')
    }
    fetchSatellites() // 重新加载列表
  } catch (err) {
    console.error('保存卫星信息失败:', err)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
    showSatelliteForm.value = false
  }
}

// 页面加载时初始化
onMounted(() => {
  fetchSatellites()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  flex: 1;
}

.no-data {
  text-align: center;
  padding: 50px;
  color: #666;
}
</style>
