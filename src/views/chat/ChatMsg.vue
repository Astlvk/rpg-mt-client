<template>
  <div class="chat-msg" ref="containerRef" @scroll="onUserScroll">
    <div ref="messagesContentRef" class="chat-msg-content">
      <MsgItem
        v-for="msg in displayMessages"
        :key="msg.id"
        :msg="msg"
        @memo="handleMemo"
        @delete="deleteMessageById"
      />
    </div>

    <el-dialog v-model="openMemo" title="检索内容" destroy-on-close fullscreen>
      <MemoInfo :docs="curDocs" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '@/schema/chat'
import type { queryInfo } from '@/schema/summary'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getMessagesBySessionIdObservable, deleteMessageById } from '@/db/useMessagesRepo'
import {
  getCurSession,
  getLastAiMsg,
  enableAutoScroll,
  registerScrollToBottomHandler,
  unregisterScrollToBottomHandler,
} from './service/workspace'
import { useChatScroll } from './service/useChatScroll'
import MemoInfo from './components/MemoMgt/MemoInfo.vue'
import MsgItem from './components/MsgItem.vue'

const curSession = getCurSession()
const lastAiMsg = getLastAiMsg()
const containerRef = ref<HTMLElement | null>(null)
const messagesContentRef = ref<HTMLElement | null>(null)
const openMemo = ref(false)
const curDocs = ref<queryInfo[]>([])

const {
  scheduleScrollToBottom,
  onUserScroll,
  attachResizeObserver,
  dispose: disposeChatScroll,
} = useChatScroll(containerRef, { thresholdPx: 24 })

const messagesWrap = computed(() =>
  getMessagesBySessionIdObservable(
    curSession.value?.id,
    curSession.value?.config.windowMsgNum || 50,
  ),
)

const messages = computed(() => [...(messagesWrap.value.value || [])].reverse())

const displayMessages = computed(() => {
  const pendingAiMsg = lastAiMsg.value

  if (!pendingAiMsg) {
    return messages.value
  }

  if (messages.value.some((msg) => msg.id === pendingAiMsg.id)) {
    return messages.value
  }

  return [...messages.value, pendingAiMsg]
})

function handleMemo(msg: Message) {
  openMemo.value = true
  curDocs.value = msg.docs || []
}

watch(
  displayMessages,
  () => {
    scheduleScrollToBottom()
  },
  {
    flush: 'post',
  },
)

watch(
  () => curSession.value?.id,
  () => {
    enableAutoScroll()
    scheduleScrollToBottom(true)
  },
  {
    flush: 'post',
  },
)

watch(
  messagesContentRef,
  (el) => {
    if (el) {
      attachResizeObserver(el)
    }
  },
  { flush: 'post', immediate: true },
)

onMounted(() => {
  registerScrollToBottomHandler(scheduleScrollToBottom)
  scheduleScrollToBottom(true)
})

onBeforeUnmount(() => {
  unregisterScrollToBottomHandler(scheduleScrollToBottom)
  disposeChatScroll()
})
</script>

<style lang="postcss" scoped>
.chat-msg {
  flex: 1;
  min-height: 0;
  padding: 20px;
  overflow-y: auto;
  background-color: #fafafa;
  /* overflow-anchor: none; */
}

.chat-msg-content {
  min-height: 1px;
  /* overflow-anchor: none; */
}

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
