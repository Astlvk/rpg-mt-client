import { ref, nextTick } from 'vue'
import type { Session, Message } from '@/schema/chat'

const curSession = ref<Session | null>(null)
const lastAiMsg = ref<Message | null>(null)
const msgContainer = ref<HTMLElement | null>(null)
const autoScrollEnabled = ref(true)

function setCurSession(session: Session) {
  curSession.value = session
}

function getCurSession() {
  return curSession
}

function setLastAiMsg(msg: Message | null) {
  lastAiMsg.value = msg
  return lastAiMsg
}

function getLastAiMsg() {
  return lastAiMsg
}

function setAutoScrollEnabled(enabled: boolean) {
  autoScrollEnabled.value = enabled
}

function scrollToBottom() {
  if (!autoScrollEnabled.value) {
    return
  }
  nextTick(() => {
    if (msgContainer.value) {
      msgContainer.value.scrollTop = msgContainer.value.scrollHeight
    }
  })
}

export {
  msgContainer,
  scrollToBottom,
  setCurSession,
  getCurSession,
  setLastAiMsg,
  getLastAiMsg,
  setAutoScrollEnabled,
}
