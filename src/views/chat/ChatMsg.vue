<template>
  <div class="chat-msg" ref="msgContainer">
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
        </div>
        <div class="msg-time">{{ dayjs(msg.createdAt).format('YYYY-MM-DD HH:mm:ss') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import dayjs from 'dayjs'
import { Role } from '@/schema/chat'
import { useMessagesRepo } from '@/db/useMessagesRepo'
import { getCurSession } from './service/workspace'
import { User, Service } from '@element-plus/icons-vue'
import { MdPreview } from 'md-editor-v3'

const msgContainer = ref<HTMLElement | null>(null)
const curSession = getCurSession()
const { getMessagesBySessionIdObservable } = useMessagesRepo()
// 函数返回的是一个ref对象，所以使用的时候需要主动.value，包装为computed只是为了响应式切换
const messagesWrap = computed(() => getMessagesBySessionIdObservable(curSession.value?.id))
// 主动解包一层
const messages = computed(() => messagesWrap.value.value)

watch(
  () => messages.value,
  () => {
    nextTick(() => {
      scrollToBottom()
    })
  },
)

function scrollToBottom() {
  if (msgContainer.value) {
    msgContainer.value.scrollTop = msgContainer.value.scrollHeight
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
  padding: 0px 16px;
  /* padding: 12px 16px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap; */
}

.msg-time {
  font-size: 11px;
  color: #c0c4cc;
  margin-top: 4px;
}
</style>
