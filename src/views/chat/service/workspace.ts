import { ref } from 'vue'
import type { Session } from '@/schema/chat'

const curSession = ref<Session | null>(null)

function setCurSession(session: Session) {
  curSession.value = session
}

function getCurSession() {
  return curSession
}

export { setCurSession, getCurSession }
