import { ref, nextTick } from 'vue'
import { useThrottleFn } from '@vueuse/core'
import { getSession } from '@/db/useSessionsRepo'
import type { Session, Message } from '@/schema/chat'

const curSession = ref<Session | null>(null)
const lastAiMsg = ref<Message | null>(null)
const msgContainer = ref<HTMLElement | null>(null)
const isAutoScrollEnabled = ref(true)
const summaryLoading = ref(false)
const throttledScrollToBottom = useThrottleFn(scrollToBottom, 300)

function setCurSession(session: Session | null) {
  curSession.value = session
}

function getCurSession() {
  return curSession
}

// 根据sessionId重新设置curSession
async function refreshCurSession(sessionId: string) {
  const session = await getSession(sessionId)
  if (session) {
    setCurSession(session)
    return curSession
  } else {
    throw new Error('会话不存在')
  }
}

function setLastAiMsg(msg: Message | null) {
  lastAiMsg.value = msg
  return lastAiMsg
}

function getLastAiMsg() {
  return lastAiMsg
}

function setAutoScrollEnabled(enabled: boolean) {
  isAutoScrollEnabled.value = enabled
}

function getSummaryLoading() {
  return summaryLoading
}

function setSummaryLoading(loading: boolean) {
  summaryLoading.value = loading
}

function scrollToBottom() {
  if (isAutoScrollEnabled.value) {
    nextTick(() => {
      requestAnimationFrame(() => {
        if (msgContainer.value) {
          msgContainer.value.scrollTop = msgContainer.value.scrollHeight
        }
      })
    })
  }
}

function enableAutoScroll() {
  isAutoScrollEnabled.value = true
}

function disableAutoScroll() {
  isAutoScrollEnabled.value = false
}

export {
  msgContainer,
  getSummaryLoading,
  setSummaryLoading,
  scrollToBottom,
  throttledScrollToBottom,
  enableAutoScroll,
  disableAutoScroll,
  setCurSession,
  getCurSession,
  setLastAiMsg,
  getLastAiMsg,
  setAutoScrollEnabled,
  refreshCurSession,
}
