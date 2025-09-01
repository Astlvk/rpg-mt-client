<template>
  <div class="chat-msg" ref="msgContainer" @scroll="handleScroll">
    <MsgItem
      v-for="msg in messages"
      :key="msg.id"
      :msg="msg"
      @memo="handleMemo"
      @delete="deleteMessageById"
    />
    <MsgItem v-if="lastAiMsg" :msg="lastAiMsg" />

    <el-dialog v-model="openMemo" title="检索内容" destroy-on-close fullscreen>
      <MemoInfo :docs="curDocs" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '@/schema/chat'
import type { queryInfo } from '@/schema/summary'
import { computed, watch, ref } from 'vue'
import { getMessagesBySessionIdObservable, deleteMessageById } from '@/db/useMessagesRepo'
import {
  msgContainer,
  scrollToBottom,
  getCurSession,
  getLastAiMsg,
  enableAutoScroll,
  disableAutoScroll,
} from './service/workspace'
import MemoInfo from './components/MemoMgt/MemoInfo.vue'
import MsgItem from './components/MsgItem.vue'

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
  return res
})
const openMemo = ref(false)
const curDocs = ref<queryInfo[]>([])

watch(
  messages,
  () => {
    scrollToBottom()
  },
  {
    flush: 'post',
  },
)

function handleScroll(e: Event) {
  const container = e.target as HTMLElement

  // 判断是否滚动到底部
  const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 20

  if (isAtBottom) {
    // 滚动到底部，启用自动滚动
    enableAutoScroll()
  } else {
    // 禁用自动滚动
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

@media (max-width: 600px) {
  .chat-msg {
    padding: 0px;
  }
}
</style>
