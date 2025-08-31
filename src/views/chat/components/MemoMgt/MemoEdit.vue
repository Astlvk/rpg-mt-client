<template>
  <div class="memo-edit">
    <el-dialog v-model="open" title="摘要详情" width="50%">
      <div class="summary-con">
        <MdEditor ref="mdEditorRef" v-model="curSummary" :codeFoldable="false" :preview="false" />
      </div>

      <template #footer>
        <el-button type="primary" :loading="btnLoading" @click="handleUpdate">更新</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'
import type { ExposeParam } from 'md-editor-v3'
import type { SummaryItem } from '@/schema/summary'
import { addSummary } from '@/api/base.api'
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

const emit = defineEmits(['update:modelValue'])
const open = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

const btnLoading = ref(false)
const curSummaryItem = ref<SummaryItem | null>(null)
const curSummary = ref('')
const mdEditorRef = ref<ExposeParam | null>(null)

function init() {
  console.log('init')
}

function handleAdd() {
  curSummary.value = ''
}

function handleUpdate() {
  btnLoading.value = true
}
</script>
