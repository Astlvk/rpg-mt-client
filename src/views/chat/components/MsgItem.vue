<template>
  <div
    class="msg-item"
    :class="{ 'msg-user': msg.role === Role.USER, 'msg-bot': msg.role === Role.AI }"
  >
    <div class="msg-avatar">
      <el-avatar :size="36">
        <el-icon v-if="msg.role === Role.USER"><User /></el-icon>
        <el-icon v-else><Service /></el-icon>
      </el-avatar>
    </div>

    <div class="msg-content">
      <div v-if="showThinkingBlock" class="msg-thinking">
        <button type="button" class="thinking-toggle" @click="toggleThinking">
          <span>{{ thinkingVisible ? '隐藏思考过程' : '查看思考过程' }}</span>
          <span v-if="msg.loading" class="thinking-status">思考中...</span>
        </button>

        <div v-if="thinkingVisible" class="thinking-body">
          <MarkdownRender
            class="thinking-markdown"
            :content="thinkingText"
            :final="!msg.loading"
            :typewriter="false"
            custom-id="chat-thinking"
          />
        </div>
      </div>

      <div class="msg-text">
        <MarkdownRender
          class="msg-markdown"
          :content="msg.content || ''"
          :final="!msg.loading"
          :typewriter="false"
          :custom-id="`chat-msg-${msg.role}`"
        />

        <div v-if="msg.loading" class="msg-loading">
          <el-icon class="is-loading" size="16">
            <Loading />
          </el-icon>
          <span>{{ loadingText }}</span>
        </div>
      </div>

      <div class="msg-time">
        {{ dayjs(msg.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
        <el-divider direction="vertical" />
        {{ msg.turn }}
        <el-divider direction="vertical" />
        <el-button
          v-if="msg.docs && msg.docs.length > 0"
          type="primary"
          link
          size="small"
          :icon="Memo"
          @click="handleMemo(msg)"
        />

        <el-tooltip
          v-if="msg.usageMetadata"
          class="box-item"
          effect="light"
          placement="bottom"
          :content="`input: ${msg.usageMetadata.inputTokens}, output: ${msg.usageMetadata.outputTokens}, total: ${msg.usageMetadata.totalTokens}`"
        >
          <el-button :icon="Histogram" type="primary" link size="small" style="margin-left: 0px" />
        </el-tooltip>

        <el-popconfirm
          v-if="!msg.id.includes(aiMsgIdPrefix)"
          title="确定删除该消息吗？"
          placement="left-start"
          width="200"
          cancel-button-text="取消"
          confirm-button-text="确定"
          @confirm="deleteMessageById(msg.id)"
        >
          <template #reference>
            <el-button type="danger" link size="small" :icon="Delete" style="margin-left: 0px" />
          </template>
        </el-popconfirm>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type PropType, watch } from 'vue'
import type { Message } from '@/schema/chat'
import { Role } from '@/schema/enum'
import dayjs from 'dayjs'
import MarkdownRender from 'markstream-vue'
import { User, Service, Loading, Delete, Memo, Histogram } from '@element-plus/icons-vue'

const props = defineProps({
  msg: {
    type: Object as PropType<Message>,
    required: true,
  },
})
const emit = defineEmits(['memo', 'delete'])
const aiMsgIdPrefix = 'firstAiMsg-'
const thinkingVisible = ref(false)

const thinkingText = computed(() => props.msg.thinking || '')

const loadingText = computed(() => {
  const hasThinking = Boolean(thinkingText.value.trim())
  const hasContent = Boolean((props.msg.content || '').trim())
  return hasThinking && !hasContent ? '思考中...' : '生成中...'
})

const showThinkingBlock = computed(
  () => props.msg.role === Role.AI && Boolean(thinkingText.value.trim()),
)

watch(
  showThinkingBlock,
  (visible) => {
    if (visible) {
      thinkingVisible.value = true
    }
  },
  { immediate: true },
)

const handleMemo = (msg: Message) => {
  emit('memo', msg)
}

const deleteMessageById = (id: string) => {
  emit('delete', id)
}

const toggleThinking = () => {
  thinkingVisible.value = !thinkingVisible.value
}
</script>

<style lang="postcss" scoped>
.msg-item {
  display: flex;
  margin-bottom: 20px;

  &.msg-user {
    flex-direction: row-reverse;

    .msg-content {
      margin-left: 0;
      margin-right: 12px;
      align-items: flex-end;
    }

    .msg-text {
      background-color: #409eff;
      border-radius: 18px 18px 4px 18px;
      color: #fff;
    }
  }

  &.msg-bot {
    .msg-text {
      background-color: #fff;
      color: #303133;
      border-radius: 18px 18px 18px 4px;
      border: 1px solid #e4e7ed;
    }
  }

  .msg-avatar {
    flex-shrink: 0;
  }

  .msg-content {
    margin-left: 12px;
    display: flex;
    flex-direction: column;
    max-width: 70%;
  }

  .msg-thinking {
    margin-bottom: 8px;
    border: 1px solid #ebeef5;
    border-radius: 14px;
    background: #f7f8fa;
    overflow: hidden;
  }

  .thinking-toggle {
    width: 100%;
    border: 0;
    background: transparent;
    color: #606266;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    font-size: 12px;
    cursor: pointer;
  }

  .thinking-status {
    color: #909399;
  }

  .thinking-body {
    border-top: 1px solid #ebeef5;
    padding: 0 14px 10px;
    color: #606266;

    :deep(.markstream-vue) {
      color: inherit;
      background: transparent;
      font-size: 13px;
    }

    :deep(.markstream-vue p:first-child) {
      margin-top: 10px;
    }

    :deep(.markstream-vue p:last-child) {
      margin-bottom: 0;
    }

    :deep(.markstream-vue pre) {
      max-width: 100%;
      overflow-x: auto;
    }
  }

  .msg-text {
    padding: 4px 16px;
    min-height: 20px;

    :deep(.markstream-vue) {
      color: inherit;
      background: transparent;
    }

    :deep(.markstream-vue p:first-child) {
      margin-top: 0;
    }

    :deep(.markstream-vue p:last-child) {
      margin-bottom: 0;
    }

    :deep(.markstream-vue pre) {
      max-width: 100%;
      overflow-x: auto;
    }
  }

  .msg-time {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #c0c4cc;
    margin-top: 4px;
  }

  .msg-loading {
    display: flex;
    align-items: center;
    gap: 4px;

    span {
      font-size: 13px;
      color: #909399;
    }
  }
}

@media (max-width: 600px) {
  .msg-item .msg-content {
    max-width: 100%;
    min-width: 0;
    margin-left: 0;
    margin-right: 0;
  }
  .msg-item .msg-avatar {
    display: none;
  }
}
</style>
