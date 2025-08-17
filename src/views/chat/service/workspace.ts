import { ref } from 'vue'
import type { Session } from '@/schema/db'

const curChatSession = ref<Session | null>(null)

function setCurChatSession(session: Session) {
  curChatSession.value = session
}

function getCurChatSession() {
  return curChatSession.value
}

export { setCurChatSession, getCurChatSession }
