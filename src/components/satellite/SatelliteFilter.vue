<template>
  <div class="filter-form">
    <el-form :model="filterForm" label-width="80px" size="small">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-form-item label="所属分组">
            <el-select v-model="filterForm.groupId" placeholder="请选择分组" clearable filterable>
              <el-option
                v-for="group in groupList"
                :key="group.id"
                :label="group.groupName"
                :value="group.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="显示状态">
            <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
              <el-option label="显示" value="true"></el-option>
              <el-option label="隐藏" value="false"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="卫星名称">
            <el-input
              v-model="filterForm.keyword"
              placeholder="请输入卫星名称"
              clearable
              @keyup.enter="handleFilter"
              :prefix-icon="Search"
            >
              <template #append>
                <el-button type="primary" @click="handleFilter">
                  <el-icon><Search /></el-icon> 搜索
                </el-button>
                <el-button @click="resetFilter">重置</el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { defineEmits } from 'vue'
import { useGroupStore } from '@/stores/groupStore'
import { useSatelliteStore } from '@/stores/satelliteStore'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Emits
const emit = defineEmits(['filter-change'])

const groupStore = useGroupStore()
const satelliteStore = useSatelliteStore()
const groupList = computed(() => groupStore.groupList)

// 筛选表单数据
const filterForm = ref({
  groupId: null as number | null,
  status: null as string | null, // 'true' | 'false' | null
  keyword: '',
})

// 加载分组数据
onMounted(async () => {
  if (groupList.value.length === 0) {
    try {
      await groupStore.fetchGroupList({})
    } catch (error) {
      console.error('加载分组数据失败:', error)
      ElMessage.error('加载分组数据失败')
    }
  }
})

// 处理筛选
const handleFilter = async () => {
  try {
    // 转换状态值为boolean
    const status =
      filterForm.value.status === 'true' ? true :
      filterForm.value.status === 'false' ? false : null

    // 触发父组件筛选
    emit('filter-change', {
      groupId: filterForm.value.groupId,
      status,
      keyword: filterForm.value.keyword,
    })

    // 同步搜索卫星
    if (filterForm.value.keyword) {
      await satelliteStore.fetchSatelliteList({
        page: 1,
        size: 100,
        keyword: filterForm.value.keyword,
      })
    }
  } catch (error) {
    console.error('筛选失败:', error)
    ElMessage.error('筛选操作失败')
  }
}

// 重置筛选条件
const resetFilter = () => {
  filterForm.value = {
    groupId: null,
    status: null,
    keyword: '',
  }
  
  // 触发空条件筛选
  emit('filter-change', {
    groupId: null,
    status: null,
    keyword: '',
  })
}
</script>

<style scoped>
.filter-form {
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.el-form) {
  margin-bottom: 0;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-input-group__append) {
  padding: 0;
  border-left: none;
}

:deep(.el-input-group__append button) {
  border: none;
  height: 100%;
  border-radius: 0;
}
</style>
