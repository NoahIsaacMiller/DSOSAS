<template>
  <div class="sidebar-container">
    <!-- 标签页切换 -->
    <div class="tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'satellite' }"
        @click="activeTab = 'satellite'"
      >
        卫星管理
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'group' }"
        @click="activeTab = 'group'"
      >
        分组管理
      </button>
    </div>

    <!-- 标签页内容 -->
    <div class="tab-content">
      <SatelliteList v-if="activeTab === 'satellite'" />
      <GroupManager v-if="activeTab === 'group'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SatelliteList from '@/views/SatelliteList.vue'
import GroupManager from '@/views/GroupManager.vue'

// 激活的标签页（默认卫星管理）
const activeTab = ref<'satellite' | 'group'>('satellite')
</script>

<style scoped>
.sidebar-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.tab-btn {
  flex: 1;
  padding: 14px 0;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 15px;
  cursor: pointer;
}

.tab-btn.active {
  border-bottom-color: #42b983;
  color: #42b983;
  font-weight: 500;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}
</style>
