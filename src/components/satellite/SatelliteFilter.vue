<template>
  <el-form :inline="true" :model="filterForm" class="filter-form">
    <!-- 分组筛选 -->
    <el-form-item label="所属分组">
      <el-select
        v-model="filterForm.groupId"
        placeholder="全部分组"
        clearable
        @change="handleFilter"
      >
        <el-option
          v-for="group in groupList"
          :key="group.id"
          :label="group.groupName"
          :value="group.id"
        />
      </el-select>
    </el-form-item>

    <!-- 状态筛选 -->
    <el-form-item label="显示状态">
      <el-select
        v-model="filterForm.status"
        placeholder="全部状态"
        clearable
        @change="handleFilter"
      >
        <el-option label="显示" value="true" />
        <el-option label="隐藏" value="false" />
      </el-select>
    </el-form-item>

    <!-- 搜索框 -->
    <el-form-item>
      <el-input
        v-model="filterForm.keyword"
        placeholder="搜索卫星名称"
        clearable
        style="width: 200px"
        @keyup.enter="handleFilter"
      >
        <template #append>
          <el-button icon="Search" @click="handleFilter" />
        </template>
      </el-input>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { defineEmits } from 'vue'
import { useGroupStore } from '@/stores/groupStore'
import { useSatelliteStore } from '@/stores/satelliteStore'

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
onMounted(() => {
  if (groupList.value.length === 0) {
    groupStore.fetchGroupList({})
  }
})

// 处理筛选
const handleFilter = () => {
  // 转换状态值为boolean
  const status =
    filterForm.value.status === 'true' ? true : filterForm.value.status === 'false' ? false : null

  // 触发父组件筛选
  emit('filter-change', {
    groupId: filterForm.value.groupId,
    status,
    keyword: filterForm.value.keyword,
  })

  // 同步搜索卫星
  if (filterForm.value.keyword) {
    satelliteStore.fetchSatelliteList({
      page: 1,
      size: 100,
      keyword: filterForm.value.keyword,
    })
  }
}
</script>

<style scoped>
.filter-form {
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
}
</style>
