<template>
  <div class="session-config">
    <el-drawer
      v-model="open"
      title="会话设置"
      size="50%"
      direction="rtl"
      append-to-body
      destroy-on-close
      :z-index="1001"
      @open="handleOpen"
      @close="handleClose"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-collapse v-model="activeNames">
          <el-collapse-item title="基础设置" name="base">
            <el-form-item label="会话名称" prop="title">
              <el-input v-model="form.title" />
            </el-form-item>

            <el-form-item label="历史消息数量" prop="config.history">
              <el-input-number v-model="form.config.history" :min="1" :max="100" />
            </el-form-item>
          </el-collapse-item>

          <el-collapse-item title="模型设置" name="model">
            <el-form-item label="API Key" :prop="`config.apiKey`">
              <el-input v-model="form.config.apiKey" />
            </el-form-item>

            <el-form-item label="Base URL" :prop="`config.baseUrl`">
              <el-input v-model="form.config.baseUrl" />
            </el-form-item>

            <div style="display: flex">
              <div style="flex: 1">
                <template v-for="item in modelConfigTypes" :key="item">
                  <div v-show="item === activeNameTab">
                    <el-form-item label="模型" :prop="`config.${item}.model`">
                      <el-select v-model="form.config[item].model" :options="modelOptions" />
                    </el-form-item>

                    <el-form-item label="温度" :prop="`config.${item}.temperature`">
                      <el-slider
                        v-model="form.config[item].temperature"
                        :min="0"
                        :max="1"
                        :step="0.01"
                      />
                    </el-form-item>

                    <el-form-item label="最大token" :prop="`config.${item}.maxTokens`">
                      <el-input-number
                        v-model="form.config[item].maxTokens"
                        :min="1"
                        :max="65536"
                      />
                    </el-form-item>
                  </div>
                </template>
              </div>

              <el-tabs v-model="activeNameTab" tab-position="left">
                <el-tab-pane label="写作模型" name="writerModel" />
                <el-tab-pane label="检索模型" name="retrieverModel" />
                <el-tab-pane label="摘要模型" name="summaryModel" />
              </el-tabs>
            </div>
          </el-collapse-item>

          <el-collapse-item title="提示设置" name="prompt">
            <el-form-item label="系统提示词" prop="config.sysPrompt">
              <MdEditor
                v-model="form.config.sysPrompt"
                :preview="false"
                :toolbars="toolbars"
                style="height: 200px"
                placeholder="系统提示词，可用于设置角色、世界观等"
              />
            </el-form-item>

            <el-form-item label="指令提示词" prop="config.instructionPrompt">
              <MdEditor
                v-model="form.config.instructionPrompt"
                :preview="false"
                :toolbars="toolbars"
                style="height: 200px"
                placeholder="指令提示词，用于指示每次AI如何生成内容"
              />
            </el-form-item>
          </el-collapse-item>

          <el-collapse-item title="摘要设置" name="summary">
            <el-form-item label="启用摘要" prop="config.enableSummary">
              <el-switch v-model="form.config.enableSummary" />
            </el-form-item>

            <el-form-item label="摘要提示" prop="config.summaryPrompt">
              <MdEditor
                v-model="form.config.summaryPrompt"
                :preview="false"
                :toolbars="toolbars"
                style="height: 200px"
                placeholder="用于生成历史摘要的提示词"
              />
            </el-form-item>

            <el-form-item label="摘要轮数" prop="config.summaryTurn">
              <el-input-number v-model="form.config.summaryTurn" :min="1" />
            </el-form-item>
          </el-collapse-item>

          <el-collapse-item title="召回设置" name="retriever">
            <el-form-item label="启用召回" prop="config.enableRetriever">
              <el-switch v-model="form.config.enableRetriever" />
            </el-form-item>

            <el-form-item label="召回类别" prop="config.retrieverCategory">
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

            <el-form-item label="召回方式" prop="config.retrieverType">
              <el-radio-group v-model="form.config.retrieverType">
                <template v-for="item in retrieverTypeOptions" :key="item.value">
                  <el-radio :label="item.label" :value="item.value" />
                </template>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="召回距离" prop="config.distance">
              <el-input-number v-model="form.config.distance" :min="0" :max="1" :step="0.01" />
            </el-form-item>

            <el-form-item label="召回数量" prop="config.topK">
              <el-input-number v-model="form.config.topK" :min="1" :max="100" />
            </el-form-item>

            <el-form-item label="检索方式" prop="config.searchMode">
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

            <el-form-item label="检索词提取" prop="config.queryExtractPrompt">
              <MdEditor
                v-model="form.config.queryExtractPrompt"
                :preview="false"
                :toolbars="toolbars"
                style="height: 200px"
                placeholder="用于提取检索词的提示词"
              />
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </el-form>

      <template #footer>
        <el-button @click="open = false">取消</el-button>
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
import { MdEditor, type ToolbarNames } from 'md-editor-v3'

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
  formRef,
  modelOptions,
  retrieverTypeOptions,
  retrieverCategoryOptions,
  searchModeOptions,
  modelConfigTypes,
  activeNames,
  activeNameTab,
  form,
  rules,
  save,
  init,
} = useSessionConfig()
const toolbars: ToolbarNames[] = [
  'pageFullscreen',
  'fullscreen',
  '-',
  'bold',
  'underline',
  'italic',
  '-',
  'title',
  'strikeThrough',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  '-',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  'mermaid',
  'katex',
  '-',
  'revoke',
  'next',
  'save',
  '=',
  'preview',
  'previewOnly',
  'htmlPreview',
  'catalog',
  'github',
]

function handleOpen() {
  init()
}

function handleClose() {
  formRef.value?.resetFields()
}

function handleSave() {
  save()
}
</script>
