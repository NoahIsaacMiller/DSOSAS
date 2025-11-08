<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑分组' : '新增分组'"
    :width="500"
    :before-close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="分组名称" prop="groupName">
        <el-input v-model="formData.groupName" placeholder="请输入分组名称" clearable />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          placeholder="请输入分组描述"
          clearable
          :rows="3"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { defineProps, defineEmits, useModel } from 'vue'
import type { FormInstance } from 'element-plus'
import { useGroupStore } from '@/stores/groupStore'

// Props
const props = defineProps({
  visible: { type: Boolean, default: false },
  isEdit: { type: Boolean, default: false },
  initialData: {
    type: Object,
    default: () => ({ groupName: '', description: '' }),
  },
})

// Emits
const emit = defineEmits(['update:visible', 'confirm'])
const visible = useModel(props, 'visible')

// 表单引用
const formRef = ref<FormInstance>()
const groupStore = useGroupStore()

// 表单数据
const formData = ref({
  id: props.initialData.id || '',
  groupName: props.initialData.groupName || '',
  description: props.initialData.description || '',
})

// 表单验证规则
const formRules = ref({
  groupName: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
})

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    emit('confirm', { ...formData.value })
    handleClose()
  } catch (error) {
    // 验证失败不处理（Element会自动提示）
  }
}
</script>
