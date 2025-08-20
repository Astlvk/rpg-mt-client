import type { Session } from '@/schema/chat'
import { watch } from 'vue'
import { getUUID } from '@/utils'
import {
  sessions,
  getSessionCount,
  getSessionByIndex,
  addSession,
  deleteSession,
} from '@/db/useSessionsRepo'
import { deleteMessagesBySessionId } from '@/db/useMessagesRepo'
import { setCurSession, getCurSession, setAutoScrollEnabled } from './workspace'
import { ElMessageBox } from 'element-plus'

export function useSession() {
  const curSession = getCurSession()

  watch(curSession, () => {
    setAutoScrollEnabled(true)
  })

  async function init() {
    const count = await getSessionCount()

    // 初始化，不存在则创建
    if (count === 0) {
      const newSession = buildNewSession()
      await addSession(newSession)
      setCurSession(newSession)
    }

    if (count > 0) {
      const session = await getSessionByIndex(count - 1)
      if (session) {
        setCurSession(session)
      }
    }
  }

  // 选择会话
  function handleSelectSession(session: Session) {
    setCurSession(session)
  }

  // 创建会话
  async function handleCreateSession() {
    const newSession = buildNewSession()
    await addSession(newSession)
    setCurSession(newSession)
  }

  // 删除会话
  function handleDel(sessionId: string) {
    ElMessageBox.confirm('将会删除该会话下的所有消息，确认删除吗？', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      customStyle: {
        position: 'relative',
        top: '-10%',
      },
    }).then(async () => {
      await deleteSession(sessionId)
      await deleteMessagesBySessionId(sessionId)
    })
  }

  // 构建新会话对象
  function buildNewSession() {
    const newSession = {
      id: getUUID(),
      title: '新的世界',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    return newSession
  }

  return {
    sessions,
    curSession,
    init,
    handleSelectSession,
    handleCreateSession,
    handleDel,
  }
}
