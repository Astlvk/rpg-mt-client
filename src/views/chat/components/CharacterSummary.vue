<template>
  <el-drawer
    v-model="open"
    title="角色摘要"
    size="100%"
    direction="rtl"
    append-to-body
    destroy-on-close
    :z-index="1001"
    :close-on-press-escape="false"
    @open="handleOpen"
    @close="handleClose"
  >
    <div class="character-summary">
      <el-collapse v-model="activeNames">
        <el-collapse-item title="提示词" name="prompt">
          <MdEditor
            v-model="form.sysPrompt"
            :preview="false"
            :toolbars="TOOL_BARS"
            style="height: 150px"
            placeholder="系统提示词"
          />
          <MdEditor
            v-model="form.prompt"
            :preview="false"
            :toolbars="TOOL_BARS"
            style="margin-top: 10px; height: 150px"
            placeholder="指令提示词"
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

        <el-collapse-item title="角色摘要" name="summary">
          <MdEditor
            v-model="summary"
            :preview="false"
            :toolbars="TOOL_BARS"
            style="height: 200px"
            placeholder="角色摘要"
          />
        </el-collapse-item>
      </el-collapse>
    </div>

    <template #footer>
      <el-button @click="open = false">取消</el-button>
      <el-button type="primary" plain :loading="btnInsLoading" @click="handleIns">插入</el-button>
      <el-button type="primary" plain :loading="btnLoading" @click="handleGen">生成</el-button>
      <el-button type="primary" plain @click="handleSave">保存</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { chatBase, addSummary } from '@/api/base.api'
import { SummaryType } from '@/schema/enum'
import { TOOL_BARS } from '../service/constCommon'
import { getCurSession } from '../service/workspace'
import { updateSessionDot } from '@/db/useSessionsRepo'
import { buildAiMessage } from '@/db/useMessagesRepo'
import { refreshCurSession } from '../service/workspace'
import { ElMessage } from 'element-plus'
import { MdEditor } from 'md-editor-v3'

const emit = defineEmits(['update:modelValue', 'done', 'close'])
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
const open = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

const curSession = getCurSession()
const activeNames = ref(['prompt', 'text', 'summary'])
const btnLoading = ref(false)
const btnInsLoading = ref(false)
const form = ref({
  sysPrompt: '',
  prompt: '',
  text: '',
  type: '角色',
})
const summary = ref('')

function handleOpen() {
  init()
}

function handleClose() {
  console.log('handleClose')
}

function init() {
  if (curSession.value) {
    form.value.sysPrompt = curSession.value.config.characterSummarySystemPrompt ?? ''
    form.value.prompt = curSession.value.config.characterSummaryPrompt ?? ''
  }
}

async function saveConfig() {
  if (curSession.value) {
    await updateSessionDot(curSession.value.id, {
      'config.characterSummarySystemPrompt': form.value.sysPrompt,
      'config.characterSummaryPrompt': form.value.prompt,
      updatedAt: Date.now(),
    })
    await refreshCurSession(curSession.value.id)
  }
}

async function characterSummary() {
  btnLoading.value = true
  try {
    if (curSession.value) {
      await saveConfig()

      // 摘要生成
      const curTurn = curSession.value.turn
      const msgs = [buildAiMessage(curSession.value.id, curTurn, form.value.text)]
      if (curSession.value.config.characterSummaryPrompt) {
        msgs.unshift(
          buildAiMessage(
            curSession.value.id,
            curTurn,
            curSession.value.config.characterSummaryPrompt,
          ),
        )
      }
      const res = await chatBase({
        model: curSession.value.config.summaryModel.model,
        api_key: curSession.value.config.apiKey,
        base_url: curSession.value.config.baseUrl,
        sys_prompt: curSession.value.config.characterSummarySystemPrompt ?? '',
        messages: msgs,
        temperature: curSession.value.config.summaryModel.temperature,
        max_tokens: curSession.value.config.summaryModel.maxTokens,
        streaming: false,
      })
      summary.value = res.data
    }
  } catch (error) {
    console.error(error)
    ElMessage.error((error as Error).message)
  }
  btnLoading.value = false
}

function handleGen() {
  if (!form.value.prompt) {
    ElMessage.warning('指令提示词不能为空')
    return
  }
  if (!form.value.text) {
    ElMessage.warning('文本内容不能为空')
    return
  }
  characterSummary()
}

async function handleIns() {
  if (!summary.value) {
    ElMessage.warning('角色摘要不能为空')
    return
  }

  btnInsLoading.value = true
  try {
    if (curSession.value) {
      await addSummary(
        curSession.value.id,
        summary.value,
        curSession.value.turn,
        SummaryType.CHARACTER,
      )
      ElMessage.success('插入成功')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error((error as Error).message)
  }
  btnInsLoading.value = false
}

async function handleSave() {
  if (curSession.value) {
    await saveConfig()
    ElMessage.success('保存成功')
  }
}
</script>
