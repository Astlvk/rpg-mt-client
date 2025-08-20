<template>
  <div class="session-config">
    <el-drawer v-model="open" title="会话设置" size="50%" direction="rtl" @open="handleOpen">
      <el-form :model="form" label-width="120px">
        <el-collapse v-model="activeNames">
          <el-collapse-item title="基础设置" name="base">
            <el-form-item label="会话名称">
              <el-input v-model="form.title" />
            </el-form-item>

            <el-form-item label="系统提示词">
              <el-input
                v-model="form.config.sysPrompt"
                type="textarea"
                :rows="10"
                placeholder="系统提示词，可用于设置角色、世界观等"
              />
            </el-form-item>

            <el-form-item label="指令提示词">
              <el-input
                v-model="form.config.instructionPrompt"
                type="textarea"
                :rows="10"
                placeholder="指令提示词，用于指示每次AI如何生成内容"
              />
            </el-form-item>

            <el-form-item label="历史消息数量">
              <el-input-number v-model="form.config.history" :min="1" :max="100" />
            </el-form-item>
          </el-collapse-item>

          <el-collapse-item title="模型设置" name="model">
            <el-form-item label="API Key">
              <el-input v-model="form.config.apiKey" />
            </el-form-item>

            <el-form-item label="Base URL">
              <el-input v-model="form.config.baseUrl" />
            </el-form-item>

            <el-form-item label="模型">
              <el-select v-model="form.config.model" :options="modelOptions" />
            </el-form-item>

            <el-form-item label="温度">
              <el-slider v-model="form.config.temperature" :min="0" :max="1" :step="0.01" />
            </el-form-item>

            <el-form-item label="最大token">
              <el-input-number v-model="form.config.maxTokens" :min="1" :max="65536" />
            </el-form-item>
          </el-collapse-item>

          <el-collapse-item title="摘要设置" name="summary">
            <el-form-item label="启用摘要">
              <el-switch v-model="form.config.enableSummary" />
            </el-form-item>

            <el-form-item label="摘要生成">
              <el-input
                v-model="form.config.summaryPrompt"
                type="textarea"
                :rows="10"
                placeholder="用于生成历史摘要的提示词"
              />
            </el-form-item>

            <el-form-item label="摘要轮数">
              <el-input-number v-model="form.config.summaryTurn" :min="1" />
            </el-form-item>
          </el-collapse-item>

          <el-collapse-item title="召回设置" name="retriever">
            <el-form-item label="启用召回">
              <el-switch v-model="form.config.enableRetriever" />
            </el-form-item>

            <el-form-item label="召回类别">
              <el-checkbox-group v-model="form.config.retrieverCategory">
                <template v-for="item in retrieverCategoryOptions" :key="item.value">
                  <el-checkbox
                    :label="item.label"
                    :value="item.value"
                    :disabled="item.value === RetrieverCategory.TERM"
                  />
                </template>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="召回方式">
              <el-radio-group v-model="form.config.retrieverType">
                <template v-for="item in retrieverTypeOptions" :key="item.value">
                  <el-radio :label="item.label" :value="item.value" />
                </template>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="召回数量">
              <el-input-number v-model="form.config.topK" :min="1" :max="100" />
            </el-form-item>

            <el-form-item label="检索方式">
              <template #label>
                <span>检索方式</span>
                <el-tooltip
                  content="强制检索为每轮都触发检索，agent检索由AI判断是否触发检索"
                  placement="top"
                >
                  <el-icon><QuestionFilled /></el-icon>
                </el-tooltip>
              </template>

              <el-radio-group v-model="form.config.searchMode">
                <template v-for="item in searchModeOptions" :key="item.value">
                  <el-radio :label="item.label" :value="item.value" />
                </template>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="检索词提取">
              <el-input
                v-model="form.config.queryExtractPrompt"
                type="textarea"
                :rows="10"
                placeholder="用于提取检索词的提示词"
              />
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </el-form>

      <template #footer>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RetrieverCategory } from '@/schema/enum'
import { useSessionConfig } from './useSessionConfig'
import { QuestionFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
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

const {
  curSession,
  modelOptions,
  retrieverTypeOptions,
  retrieverCategoryOptions,
  searchModeOptions,
  activeNames,
  form,
} = useSessionConfig()

function handleOpen() {
  if (curSession.value) {
    form.id = curSession.value.id
    form.title = curSession.value.title
    form.config = curSession.value.config || form.config
  }
}

function handleSave() {
  console.log(form)
}

function handleClose() {
  open.value = false
}
</script>
