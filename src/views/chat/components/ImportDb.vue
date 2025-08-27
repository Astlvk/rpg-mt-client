<template>
  <el-dialog v-model="open" title="导入数据" width="500" @open="handleOpen" @close="handleClose">
    <el-form-item label="导入文件">
      <el-upload
        v-model:file-list="fileList"
        class="upload-demo"
        :limit="1"
        :on-exceed="handleExceed"
        :auto-upload="false"
        style="width: 100%"
      >
        <el-button type="primary" link>选择文件</el-button>

        <template #tip>
          <div class="el-upload__tip">请选择本程序导出的db文件</div>
        </template>
      </el-upload>
    </el-form-item>

    <el-form-item label="导入模式">
      <el-radio-group v-model="isOverwrite">
        <el-radio :label="true">覆盖</el-radio>
        <el-radio :label="false">追加</el-radio>
      </el-radio-group>
      <el-text type="danger"> 注意！覆盖模式，会清空当前所有数据！然后导入新数据。 </el-text>
      <el-text type="warning"> 注意！追加模式，如果选择了旧数据，新数据会被旧数据覆盖。 </el-text>
    </el-form-item>

    <template #footer>
      <el-button @click="open = false">取消</el-button>
      <el-button type="primary" :loading="btnLoading" @click="handleImport">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { importDB } from '@/db'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadUserFile } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const open = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

const fileList = ref<UploadUserFile[]>([])
const isOverwrite = ref(false)
const btnLoading = ref(false)

function handleExceed(files: UploadUserFile[]) {
  fileList.value = [...files]
}

function handleImport() {
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择文件')
    return
  }

  ElMessageBox.confirm('请确认导入模式与选择的文件是否正确！导入操作不可逆，确认导入吗？', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
    customStyle: {
      position: 'relative',
      top: '-10%',
    },
  })
    .then(async () => {
      btnLoading.value = true
      try {
        const file = fileList.value[0]
        await importDB(file.raw as Blob, isOverwrite.value, !isOverwrite.value)
        ElMessage.success('导入成功')
        open.value = false
      } catch (error) {
        console.error(error)
        ElMessage.error('导入失败，详情请查看控制台')
      }
      btnLoading.value = false
    })
    .catch(() => {
      ElMessage.info('取消导入')
    })
}

function handleOpen() {
  fileList.value = []
}

function handleClose() {
  fileList.value = []
  isOverwrite.value = false
}
</script>
