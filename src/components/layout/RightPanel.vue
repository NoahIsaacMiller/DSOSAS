<template>
  <div class="right-panel-container">
    <div class="panel-header">
      <h3>分组显示控制</h3>
      <div class="panel-actions">
        <el-button size="small" type="primary" @click="selectAll">全选</el-button>
        <el-button size="small" @click="deselectAll">取消全选</el-button>
      </div>
    </div>

    <div class="group-list">
      <div v-if="groupList.length === 0" class="empty-tip">暂无分组数据</div>
      <el-checkbox-group v-model="visibleGroupIdList">
        <div v-for="group in groupList" :key="group.id" class="group-item">
          <el-checkbox
            :label="group.id"
            @change="(checked) => toggleGroupVisibility(group.id, checked)"
          >
            <span class="group-name">{{ group.groupName }}</span>
            <span class="satellite-count">({{ group.satelliteCount || 0 }})</span>
          </el-checkbox>
        </div>
      </el-checkbox-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useGroupStore } from '@/stores/groupStore'
import { ElMessage } from 'element-plus'

const groupStore = useGroupStore()

// 分组列表
const groupList = computed(() => groupStore.groupList)

// 可见分组ID列表（用于el-checkbox-group）
const visibleGroupIdList = computed({
  get: () => Array.from(groupStore.visibleGroupIds),
  set: (value: number[]) => {
    // 处理多选框组的值变化
    const newVisibleIds = new Set(value)
    
    // 计算需要添加和移除的分组ID
    groupList.value.forEach(group => {
      const shouldBeVisible = newVisibleIds.has(group.id)
      const isCurrentlyVisible = groupStore.visibleGroupIds.has(group.id)
      
      if (shouldBeVisible !== isCurrentlyVisible) {
        groupStore.toggleGroupVisibility(group.id, shouldBeVisible)
      }
    })
  }
})

// 检查分组是否可见
const isGroupVisible = (groupId: number) => {
  return groupStore.visibleGroupIds.has(groupId)
}

// 切换分组可见性
const toggleGroupVisibility = (groupId: number, isVisible: boolean) => {
  try {
    groupStore.toggleGroupVisibility(groupId, isVisible)
  } catch (error) {
    console.error('切换分组可见性失败:', error)
    ElMessage.error('操作失败')
  }
}

// 全选
const selectAll = () => {
  if (groupList.value.length > 0) {
    try {
      groupList.value.forEach((group) => {
        groupStore.toggleGroupVisibility(group.id, true)
      })
      ElMessage.success('已全选')
    } catch (error) {
      console.error('全选失败:', error)
      ElMessage.error('全选操作失败')
    }
  } else {
    ElMessage.info('暂无分组数据')
  }
}

// 取消全选
const deselectAll = () => {
  if (groupList.value.length > 0) {
    try {
      groupList.value.forEach((group) => {
        groupStore.toggleGroupVisibility(group.id, false)
      })
      ElMessage.success('已取消全选')
    } catch (error) {
      console.error('取消全选失败:', error)
      ElMessage.error('取消全选操作失败')
    }
  }
}

// 页面加载时初始化
onMounted(() => {
  groupStore.fetchGroupList({})
})
</script>

<style scoped>
.right-panel-container {
  background: #fff;
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.panel-actions :deep(.el-button) {
  margin-left: 8px;
}

.group-list {
  max-height: calc(100% - 60px);
  overflow-y: auto;
}

.group-item {
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
}

.group-name {
  margin-right: 8px;
  font-weight: 500;
}

.satellite-count {
  color: #606266;
  font-size: 12px;
}

.empty-tip {
  text-align: center;
  padding: 20px;
  color: #909399;
  margin-bottom: 10px;
}

:deep(.el-checkbox) {
  display: flex;
  align-items: center;
  width: 100%;
}

:deep(.el-checkbox__label) {
  display: flex;
  align-items: center;
  width: 100%;
}
</style>
