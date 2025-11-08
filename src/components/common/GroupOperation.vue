<template>
  <div class="operation-buttons">
    <el-button size="small" type="primary" @click="$emit('edit', group)">
      <el-icon><Edit /></el-icon> 编辑
    </el-button>

    <el-button size="small" type="info" @click="$emit('detail', group)" class="ml-2">
      <el-icon><View /></el-icon> 详情
    </el-button>

    <el-button size="small" type="danger" @click="handleDelete" class="ml-2">
      <el-icon><Delete /></el-icon> 删除
    </el-button>

    <el-button size="small" type="success" @click="$emit('highlight', group.id)" class="ml-2">
      <el-icon><Location /></el-icon> 高亮
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { Edit, View, Delete, Location } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

// Props
const props = defineProps({
  group: {
    type: Object,
    required: true,
  },
})

// Emits
const emit = defineEmits(['edit', 'detail', 'delete', 'highlight'])

// 处理删除（带确认弹窗）
const handleDelete = () => {
  ElMessageBox.confirm(`确定要删除分组「${props.group.groupName}」吗？删除后不可恢复`, '删除确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      emit('delete', props.group.id)
    })
    .catch(() => {
      // 取消删除不处理
    })
}
</script>
