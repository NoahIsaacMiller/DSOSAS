<template>
  <div class="right-panel-container">
    <div class="panel-header">
      <h3>分组显示控制</h3>
      <div class="panel-actions">
        <button @click="selectAll">全选</button>
        <button @click="deselectAll">取消全选</button>
      </div>
    </div>

    <div class="group-list">
      <div v-for="group in groupList" :key="group.id" class="group-item">
        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="isGroupVisible(group.id)"
            @change="(e) => toggleGroupVisibility(group.id, e.target.checked)"
          />
          <span class="group-name">{{ group.groupName }}</span>
          <span class="satellite-count">({{ group.satelliteCount || 0 }})</span>
        </label>
      </div>

      <div v-if="groupList.length === 0" class="empty-tip">暂无分组数据</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGroupStore } from '@/stores/groupStore'

const groupStore = useGroupStore()

// 分组列表
const groupList = computed(() => groupStore.groupList)

// 检查分组是否可见
const isGroupVisible = (groupId: number) => {
  return groupStore.visibleGroupIds.has(groupId)
}

// 切换分组可见性
const toggleGroupVisibility = (groupId: number, isVisible: boolean) => {
  groupStore.toggleGroupVisibility(groupId, isVisible)
}

// 全选分组
const selectAll = () => {
  groupList.value.forEach((group) => {
    groupStore.toggleGroupVisibility(group.id, true)
  })
}

// 取消全选
const deselectAll = () => {
  groupList.value.forEach((group) => {
    groupStore.toggleGroupVisibility(group.id, false)
  })
}

// 初始化加载分组
onMounted(() => {
  groupStore.fetchGroupList({})
})
</script>

<style scoped>
.right-panel-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fafafa;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.panel-actions button {
  flex: 1;
  padding: 6px 0;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.group-list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.group-item {
  margin-bottom: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.checkbox-label:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.group-name {
  flex: 1;
  font-size: 14px;
}

.satellite-count {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.empty-tip {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}
</style>
