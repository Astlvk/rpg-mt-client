<template>
  <div class="memo-edit">
    <el-dialog v-model="open" title="摘要详情" width="50%" @open="handleOpen" @close="handleClose">
      <div class="summary-con">
        <MdEditor ref="mdEditorRef" v-model="curSummary" :codeFoldable="false" :preview="false" />
      </div>

      <template #footer>
        <el-button type="primary" :loading="btnLoading" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'
import type { ExposeParam } from 'md-editor-v3'
import type { SummaryItem } from '@/schema/summary'
import { getCurSession } from '../../service/workspace'
import { addSummary, updateSummary } from '@/api/base.api'
import { ElMessage } from 'element-plus'
import { MdEditor } from 'md-editor-v3'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  tenantName: {
    type: String,
    default: null,
  },
  data: {
    type: Object as PropType<SummaryItem | null>,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'success'])
const open = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

const btnLoading = ref(false)
const curSummary = ref('')
const mdEditorRef = ref<ExposeParam | null>(null)

function handleOpen() {
  init()
}

function handleClose() {
  curSummary.value = ''
}

function init() {
  if (props.data) {
    curSummary.value = props.data.summary
  } else {
    curSummary.value = ''
  }
}

async function handleSave() {
  btnLoading.value = true
  try {
    if (props.data) {
      await updateSummary(props.tenantName, props.data.uuid, curSummary.value, props.data.turn)
    } else {
      const curSession = getCurSession()
      await addSummary(props.tenantName, curSummary.value, curSession.value!.turn)
    }
    ElMessage.success('保存成功')
    open.value = false
    emit('success')
  } catch (error) {
    console.error(error)
    ElMessage.error('保存失败')
  }
  btnLoading.value = false
}
</script>
