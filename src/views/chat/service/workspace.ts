import { ref } from 'vue'
import type { Session, Message } from '@/schema/chat'

const curSession = ref<Session | null>(null)
const lastAiMsg = ref<Message | null>(null)

function setCurSession(session: Session) {
  curSession.value = session
}

function getCurSession() {
  return curSession
}

function setLastAiMsg(msg: Message) {
  lastAiMsg.value = msg
}

function getLastAiMsg() {
  return lastAiMsg
}

export { setCurSession, getCurSession, setLastAiMsg, getLastAiMsg }
