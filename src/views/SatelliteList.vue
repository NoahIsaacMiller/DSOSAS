<template>
  <div class="page-container">
    <h1>卫星列表</h1>

    <!-- 加载提示 -->
    <div v-if="loading" class="loading">加载中...</div>

    <!-- 列表内容 -->
    <div v-else class="satellite-table">
      <div class="table-header">
        <span>ID</span>
        <span>卫星名称</span>
        <span>显示状态</span>
      </div>
      <div class="table-body">
        <div v-for="sat in satelliteList" :key="sat.id" class="table-row">
          <span>{{ sat.id }}</span>
          <span>{{ sat.name }}</span>
          <span>
            <input
              type="checkbox"
              :checked="isVisible(sat.id)"
              @change="toggleVisible(sat.id, $event)"
            />
          </span>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <button @click="prevPage" :disabled="page <= 1">上一页</button>
      <span>第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
      <button @click="nextPage" :disabled="page >= totalPages">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSatelliteStore } from '@/stores/satelliteStore'

// 初始化 Store
const satelliteStore = useSatelliteStore()

// 分页参数
const page = ref(1)
const pageSize = ref(10)

// 状态提取
const satelliteList = computed(() => satelliteStore.satelliteList)
const total = computed(() => satelliteStore.total)
const loading = ref(false)

// 计算总页数
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 加载卫星列表
const fetchSatellites = async () => {
  loading.value = true
  try {
    await satelliteStore.fetchSatelliteList({ page: page.value, size: pageSize.value })
  } catch (err) {
    console.error('加载卫星失败:', err)
  } finally {
    loading.value = false
  }
}

const toggleVisible = (id: number, event: Event) => {
  const target = event.target as HTMLInputElement // 明确类型为输入框
  if (target) {
    satelliteStore.toggleSatelliteVisibility(id, target.checked)
  }
}

// 检查卫星是否可见
const isVisible = (id: number) => {
  const entity = satelliteStore.satelliteEntities.find((item) => item.baseData.id === id)
  return entity ? entity.isVisible : true
}

// 分页操作
const prevPage = () => {
  page.value--
  fetchSatellites()
}
const nextPage = () => {
  page.value++
  fetchSatellites()
}

// 页面加载时初始化
onMounted(() => {
  fetchSatellites()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.satellite-table {
  margin: 20px 0;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}
.table-header,
.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 120px;
  padding: 12px 20px;
}
.table-header {
  background: #f5f5f5;
  font-weight: bold;
}
.table-row:not(:last-child) {
  border-bottom: 1px solid #eee;
}
.pagination {
  display: flex;
  gap: 10px;
  align-items: center;
}
button {
  padding: 6px 12px;
  cursor: pointer;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.loading {
  text-align: center;
  padding: 50px;
  color: #666;
}
</style>
