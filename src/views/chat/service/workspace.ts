import { ref } from 'vue'
import { getSession } from '@/db/useSessionsRepo'
import type { Session, Message } from '@/schema/chat'

const curSession = ref<Session | null>(null)
const lastAiMsg = ref<Message | null>(null)
const isAutoScrollEnabled = ref(true)
const summaryLoading = ref(false)
let scrollToBottomHandler: ((force?: boolean) => void) | null = null

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

function getAutoScrollEnabled() {
  return isAutoScrollEnabled
}

function getSummaryLoading() {
  return summaryLoading
}

function setSummaryLoading(loading: boolean) {
  summaryLoading.value = loading
}

function scrollToBottom(force: boolean = false) {
  scrollToBottomHandler?.(force)
}

function forceScrollToBottom() {
  scrollToBottom(true)
}

function registerScrollToBottomHandler(handler: (force?: boolean) => void) {
  scrollToBottomHandler = handler
}

function unregisterScrollToBottomHandler(handler: (force?: boolean) => void) {
  if (scrollToBottomHandler === handler) {
    scrollToBottomHandler = null
  }
}

function enableAutoScroll() {
  isAutoScrollEnabled.value = true
}

function disableAutoScroll() {
  isAutoScrollEnabled.value = false
}

export {
  getSummaryLoading,
  getAutoScrollEnabled,
  setSummaryLoading,
  scrollToBottom,
  forceScrollToBottom,
  registerScrollToBottomHandler,
  unregisterScrollToBottomHandler,
  enableAutoScroll,
  disableAutoScroll,
  setCurSession,
  getCurSession,
  setLastAiMsg,
  getLastAiMsg,
  setAutoScrollEnabled,
  refreshCurSession,
}
