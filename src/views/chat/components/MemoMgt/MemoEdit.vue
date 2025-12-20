<template>
  <div class="memo-edit">
    <el-dialog v-model="open" title="摘要详情" width="50%" @open="handleOpen" @close="handleClose">
      <div class="summary-con">
        <MdEditor ref="mdEditorRef" v-model="curSummary" :codeFoldable="false" :preview="false" />
        <div class="option-con">
          <el-radio-group v-model="curSummaryType">
            <el-radio v-for="item in summaryTypeOptions" :key="item.value" :label="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </div>
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
import { SummaryType } from '@/schema/enum'
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
const curSummaryType = ref<SummaryType>(SummaryType.SUMMARY)
const summaryTypeOptions = [
  { label: '角色', value: SummaryType.CHARACTER },
  { label: '摘要', value: SummaryType.SUMMARY },
  { label: '其他', value: SummaryType.OTHER },
]
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
    curSummaryType.value = props.data.summaryType || SummaryType.SUMMARY
  } else {
    curSummary.value = ''
    curSummaryType.value = SummaryType.SUMMARY
  }
}

async function handleSave() {
  btnLoading.value = true
  try {
    if (props.data) {
      await updateSummary(
        props.tenantName,
        props.data.uuid,
        curSummary.value,
        props.data.turn,
        curSummaryType.value,
      )
    } else {
      const curSession = getCurSession()
      await addSummary(
        props.tenantName,
        curSummary.value,
        curSession.value!.turn,
        curSummaryType.value,
      )
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

<style lang="postcss" scoped>
.option-con {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
