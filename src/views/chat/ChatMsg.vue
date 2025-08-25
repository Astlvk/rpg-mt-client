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
          <MdPreview :modelValue="msg.content" :codeFoldable="false" />

          <div v-if="msg.loading" class="msg-loading">
            <el-icon class="is-loading" size="16">
              <Loading />
            </el-icon>
            <span>生成中...</span>
          </div>
        </div>
        <div class="msg-time">
          {{ dayjs(msg.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
          <el-button
            v-if="msg.docs && msg.docs.length > 0"
            type="primary"
            link
            size="small"
            :icon="Memo"
            @click="handleMemo(msg)"
          />
          <el-popconfirm
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

    <el-dialog v-model="openMemo" title="检索内容" destroy-on-close fullscreen>
      <MemoInfo :docs="curDocs" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '@/schema/chat'
import type { queryInfo } from '@/schema/summary'
import { computed, watch, ref } from 'vue'
import dayjs from 'dayjs'
import { Role } from '@/schema/enum'
import { getMessagesBySessionIdObservable, deleteMessageById } from '@/db/useMessagesRepo'
import {
  msgContainer,
  scrollToBottom,
  getCurSession,
  getLastAiMsg,
  enableAutoScroll,
  disableAutoScroll,
} from './service/workspace'
import { User, Service, Loading, Delete, Memo } from '@element-plus/icons-vue'
import { MdPreview } from 'md-editor-v3'
import MemoInfo from './components/MemoMgt/MemoInfo.vue'

const curSession = getCurSession()
const lastAiMsg = getLastAiMsg()
// 函数返回的是一个ref对象，所以使用的时候需要主动.value，包装为computed只是为了响应式切换
const messagesWrap = computed(() =>
  getMessagesBySessionIdObservable(
    curSession.value?.id,
    curSession.value?.config.windowMsgNum || 50,
  ),
)
// 主动解包一层
const messages = computed(() => {
  const res = [...(messagesWrap.value.value || [])].reverse()
  if (lastAiMsg.value) {
    res.push(lastAiMsg.value)
  }
  return res
})
const openMemo = ref(false)
const curDocs = ref<queryInfo[]>([])

watch(
  () => messages.value.length,
  () => {
    scrollToBottom()
  },
)

function handleScroll(e: Event) {
  const container = e.target as HTMLElement
  console.log(msgContainer.value === container)
  // 检查用户是否滚动到底部
  const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 20

  if (isAtBottom) {
    // 用户滚动到底部，启用自动滚动
    enableAutoScroll()
  } else {
    // 用户手动滚动且不在底部，禁用自动滚动
    disableAutoScroll()
  }
}

function handleMemo(msg: Message) {
  openMemo.value = true
  curDocs.value = msg.docs || []
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
  :deep(.md-editor-code-head) {
    z-index: 1000;
  }
}

.msg-text {
  padding: 4px 16px;
  min-height: 20px;
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
</style>
