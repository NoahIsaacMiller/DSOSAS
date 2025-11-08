<template>
  <div class="page-container">
    <h1>分组管理</h1>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="group-list">
      <div v-for="group in groupList" :key="group.id" class="group-card">
        <h3>{{ group.groupName }}</h3>
        <p>关联卫星数: {{ group.satelliteCount || 0 }}</p>
        <div class="group-ops">
          <label>
            显示分组:
            <input
              type="checkbox"
              :checked="isGroupVisible(group.id)"
              @change="toggleGroupVisible(group.id, $event)"
            />
          </label>
          <button @click="openAssociateModal(group)">关联卫星</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 关联卫星弹窗 -->
  <div class="modal-mask" v-if="modalOpen">
    <div class="modal-box">
      <h3>关联卫星到 {{ currentGroup?.groupName }}</h3>
      <!-- 修复字段名 -->
      <div class="satellite-select">
        <div v-for="sat in allSatellites" :key="sat.id" class="select-item">
          <input type="checkbox" :id="sat.id.toString()" v-model="selectedSatIds" :value="sat.id" />
          <label :for="sat.id.toString()">{{ sat.name }}</label>
        </div>
      </div>
      <div class="modal-ops">
        <button @click="modalOpen = false">取消</button>
        <button @click="confirmAssociate" class="primary">确认关联</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGroupStore } from '@/stores/groupStore'
import { useSatelliteStore } from '@/stores/satelliteStore'

const groupStore = useGroupStore()
const satelliteStore = useSatelliteStore()

// 状态
const loading = ref(false)
const groupList = computed(() => groupStore.groupList)
const allSatellites = computed(() => satelliteStore.satelliteList)

// 弹窗相关
const modalOpen = ref(false)
const currentGroup = ref<any>(null)
const selectedSatIds = ref<number[]>([])

// 加载分组
const fetchGroups = async () => {
  loading.value = true
  try {
    await groupStore.fetchGroupList({})
    // 同时加载卫星列表供选择
    await satelliteStore.fetchSatelliteList({ page: 1, size: 100 })
  } catch (err) {
    console.error('加载分组失败:', err)
  } finally {
    loading.value = false
  }
}

// 切换分组可见性（修复事件类型）
const toggleGroupVisible = (groupId: number, event: Event) => {
  const target = event.target as HTMLInputElement // 明确类型为输入框
  if (target) {
    groupStore.toggleGroupVisibility(groupId, target.checked)
  }
}

// 检查分组是否可见
const isGroupVisible = (groupId: number) => {
  return groupStore.visibleGroupIds.has(groupId)
}

// 打开关联弹窗
const openAssociateModal = (group: any) => {
  currentGroup.value = group
  selectedSatIds.value = [] // 重置选择
  modalOpen.value = true
}

// 确认关联
const confirmAssociate = async () => {
  if (!currentGroup.value || selectedSatIds.value.length === 0) return
  await groupStore.associateSatellites(currentGroup.value.id, selectedSatIds.value)
  modalOpen.value = false
}

// 初始化
onMounted(() => {
  fetchGroups()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.group-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin: 20px 0;
}
.group-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
}
.group-ops {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  align-items: center;
}
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-box {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  width: 500px;
}
.satellite-select {
  max-height: 300px;
  overflow-y: auto;
  margin: 16px 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.modal-ops {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
button.primary {
  background: #42b983;
  color: #fff;
  border: none;
}
.loading {
  text-align: center;
  padding: 50px;
  color: #666;
}
</style>
