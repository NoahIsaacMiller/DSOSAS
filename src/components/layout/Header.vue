<template>
  <div class="header-container">
    <!-- 系统名称 -->
    <div class="logo">
      <h1>深空非受控目标轨道态势感知系统</h1>
    </div>

    <!-- 全局搜索 -->
    <div class="search-box">
      <input
        type="text"
        placeholder="搜索卫星/分组..."
        v-model="searchKeyword"
        @keyup.enter="handleSearch"
      />
      <button @click="handleSearch">搜索</button>
    </div>

    <!-- 右侧操作区 -->
    <div class="header-actions">
      <button class="config-btn">系统配置</button>
      <div class="user-info">
        <img src="https://picsum.photos/id/1005/40/40" alt="用户头像" class="avatar" />
        <span>管理员</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSatelliteStore } from '@/stores/satelliteStore'

const searchKeyword = ref('')
const satelliteStore = useSatelliteStore()

// 处理搜索（同时搜索卫星和分组）
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    // 空搜索时加载全部
    satelliteStore.fetchSatelliteList({ page: 1, size: 20 })
    return
  }
  // 实际项目中调用搜索接口
  satelliteStore.fetchSatelliteList({
    page: 1,
    size: 20,
    keyword: searchKeyword.value.trim(),
  })
}
</script>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 100%;
  background-color: #fff;
}

.logo h1 {
  font-size: 18px;
  color: #333;
  margin: 0;
}

.search-box {
  display: flex;
  gap: 8px;
  width: 360px;
}

.search-box input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.search-box input:focus {
  border-color: #42b983;
}

.search-box button {
  padding: 0 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.config-btn {
  background: transparent;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
</style>
