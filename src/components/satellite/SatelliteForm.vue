<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑卫星' : '新增卫星'"
    :width="500"
    :before-close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <!-- 卫星名称 -->
      <el-form-item label="卫星名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入卫星名称" clearable />
      </el-form-item>

      <!-- TLE 第一行 -->
      <el-form-item label="TLE 第一行" prop="tle1">
        <el-input v-model="formData.tle1" placeholder="请输入TLE第一行数据" clearable />
      </el-form-item>

      <!-- TLE 第二行 -->
      <el-form-item label="TLE 第二行" prop="tle2">
        <el-input v-model="formData.tle2" placeholder="请输入TLE第二行数据" clearable />
      </el-form-item>

      <!-- 关联分组 -->
      <el-form-item label="关联分组" prop="groupIds">
        <el-checkbox-group v-model="formData.groupIds">
          <el-checkbox
            v-for="group in groupList"
            :key="group.id"
            :label="group.id"
            class="mr-4 mb-2"
          >
            {{ group.groupName }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { defineProps, defineEmits, useModel } from 'vue'
import { useGroupStore } from '@/stores/groupStore'
import type { FormInstance } from 'element-plus'

// Props
const props = defineProps({
  visible: { type: Boolean, default: false },
  isEdit: { type: Boolean, default: false },
  initialData: {
    type: Object,
    default: () => ({ name: '', tle1: '', tle2: '', groupIds: [] }),
  },
})

// Emits
const emit = defineEmits(['update:visible', 'confirm'])
const visible = useModel(props, 'visible')

// 表单引用
const formRef = ref<FormInstance>()
const groupStore = useGroupStore()
const groupList = computed(() => groupStore.groupList)

// 表单数据
const formData = ref({
  id: props.initialData.id || '',
  name: props.initialData.name || '',
  tle1: props.initialData.tle1 || '',
  tle2: props.initialData.tle2 || '',
  groupIds: props.initialData.groupIds || [],
})

// 表单验证规则
const formRules = ref({
  name: [{ required: true, message: '请输入卫星名称', trigger: 'blur' }],
  tle1: [{ required: true, message: '请输入TLE第一行数据', trigger: 'blur' }],
  tle2: [{ required: true, message: '请输入TLE第二行数据', trigger: 'blur' }],
  groupIds: [{ required: true, message: '请至少选择一个分组', trigger: 'change' }],
})

// 加载分组数据
onMounted(() => {
  if (groupList.value.length === 0) {
    groupStore.fetchGroupList({})
  }
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
