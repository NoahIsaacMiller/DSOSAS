<template>
  <div class="header-container">
    <!-- 系统名称 -->
    <div class="logo">
      <h1>深空非受控目标轨道态势感知系统</h1>
    </div>

    <!-- 全局搜索 -->
    <div class="search-box">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索卫星/分组..."
        clearable
        prefix-icon="Search"
        @keyup.enter="handleSearch"
        style="width: 280px"
      />
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon> 搜索
      </el-button>
    </div>

    <!-- 右侧操作区 -->
    <div class="header-actions">
      <el-button type="default" @click="handleConfig">
        <el-icon><Setting /></el-icon> 系统配置
      </el-button>
      <el-dropdown trigger="click">
        <div class="user-info cursor-pointer">
          <img src="https://picsum.photos/id/1005/40/40" alt="用户头像" class="avatar" />
          <span>管理员</span>
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人中心</el-dropdown-item>
            <el-dropdown-item>修改密码</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSatelliteStore } from '@/stores/satelliteStore'
import { Search, Setting, ArrowDown } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

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

// 处理系统配置
const handleConfig = () => {
  ElMessage.info('系统配置功能开发中')
}

// 处理退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '退出确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 清除token
      localStorage.removeItem('token')
      // 跳转到登录页（如果有）
      ElMessage.success('退出成功')
    })
    .catch(() => {
      // 取消退出
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
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.cursor-pointer {
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
