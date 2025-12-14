<template>
  <el-drawer
    v-model="open"
    title="角色摘要"
    size="100%"
    direction="rtl"
    append-to-body
    destroy-on-close
    :z-index="1001"
    @open="handleOpen"
    @close="handleClose"
  >
    <div class="character-summary">
      <el-collapse v-model="activeNames">
        <el-collapse-item title="系统提示词" name="sys">
          <MdEditor
            v-model="form.sysPrompt"
            :preview="false"
            :toolbars="TOOL_BARS"
            style="height: 200px"
            placeholder="系统提示词"
          />
        </el-collapse-item>

        <el-collapse-item title="文本内容" name="text">
          <MdEditor
            v-model="form.text"
            :preview="false"
            :toolbars="TOOL_BARS"
            style="height: 200px"
            placeholder="文本内容"
          />
        </el-collapse-item>
      </el-collapse>
    </div>

    <template #footer>
      <el-button @click="open = false">取消</el-button>
      <el-button type="primary" @click="handleGen">生成</el-button>
      <el-button type="primary" @click="handleIns">插入</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TOOL_BARS } from '../service/constCommon'
import { MdEditor } from 'md-editor-v3'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  sessionId: {
    type: String,
    default: '',
  },
})
const emit = defineEmits(['update:modelValue', 'done', 'close'])

const open = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

const activeNames = ref(['sys', 'text'])
const form = ref({
  sysPrompt: '',
  text: '',
  type: '角色',
})

function handleOpen() {
  console.log('handleOpen')
}

function handleClose() {
  console.log('handleClose')
}

function handleGen() {
  console.log('handleGen')
}

function handleIns() {
  console.log('handleIns')
}
</script>
