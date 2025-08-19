<template>
  <div class="chat-msg" ref="msgContainer" @scroll="handleScroll">
    <div
      v-for="msg in messages"
      :key="msg.id"
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
        <div class="msg-text">
          <MdPreview :modelValue="msg.content" />

          <div v-if="msg.loading" class="msg-loading">
            <el-icon class="is-loading" size="16">
              <Loading />
            </el-icon>
            <span>构思中...</span>
          </div>
        </div>
        <div class="msg-time">{{ dayjs(msg.createdAt).format('YYYY-MM-DD HH:mm:ss') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import dayjs from 'dayjs'
import { Role } from '@/schema/chat'
import { getMessagesBySessionIdObservable } from '@/db/useMessagesRepo'
import {
  msgContainer,
  scrollToBottom,
  getCurSession,
  getLastAiMsg,
  setAutoScrollEnabled,
} from './service/workspace'
import { User, Service } from '@element-plus/icons-vue'
import { MdPreview } from 'md-editor-v3'
import { Loading } from '@element-plus/icons-vue'

const curSession = getCurSession()
const lastAiMsg = getLastAiMsg()
// 函数返回的是一个ref对象，所以使用的时候需要主动.value，包装为computed只是为了响应式切换
const messagesWrap = computed(() => getMessagesBySessionIdObservable(curSession.value?.id))
// 主动解包一层
const messages = computed(() => {
  const res = [...(messagesWrap.value.value || [])]
  if (lastAiMsg.value) {
    res.push(lastAiMsg.value)
  }
  return res
})

watch(
  () => messages.value,
  () => {
    scrollToBottom()
  },
)

function handleScroll(e: Event) {
  const container = e.target as HTMLElement
  if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
    setAutoScrollEnabled(false)
  }
}
</script>

<style lang="postcss" scoped>
.chat-msg {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #fafafa;
}

/* 滚动条样式 */
.chat-msg::-webkit-scrollbar {
  width: 6px;
}

.chat-msg::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-msg::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-msg::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

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

      :deep(.md-editor) {
        --md-color: #fff;
      }
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
}

.msg-avatar {
  flex-shrink: 0;
}

.msg-content {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  max-width: 70%;

  :deep(.md-editor) {
    background-color: transparent;
  }
}

.msg-text {
  padding: 4px 16px;
  min-height: 20px;
}

.msg-time {
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
</style>
