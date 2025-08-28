import type { Session } from '@/schema/chat'
import { watch } from 'vue'
import { addTenant, deleteTenant } from '@/api/base.api'
import { getUUID } from '@/utils'
import {
  sessions,
  getSessionCount,
  getSessionByIndex,
  addSession,
  deleteSession,
} from '@/db/useSessionsRepo'
import { buildAiMessage, deleteMessagesBySessionId, addMessage } from '@/db/useMessagesRepo'
import { setCurSession, getCurSession, setAutoScrollEnabled } from './workspace'
import { RetrieverCategory, RetrieverMode, SearchMode } from '@/schema/enum'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'

export function useSession() {
  const curSession = getCurSession()

  watch(curSession, () => {
    setAutoScrollEnabled(true)
  })

  async function init() {
    const count = await getSessionCount()

    // 初始化，不存在则创建
    // if (count === 0) {
    //   await handleCreateSession()
    // }

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
    const loading = ElLoading.service({
      text: '创建中...',
    })
    try {
      const newSession = buildNewSession()
      await addTenant(newSession.id)
      await addSession(newSession)
      setCurSession(newSession)
      await createFirstAiMsg()
    } catch (error) {
      console.error(error)
      ElMessage.error('创建会话失败')
    }
    loading.close()
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
      const loading = ElLoading.service({
        text: '删除中...',
      })
      try {
        await deleteSession(sessionId)
        await deleteMessagesBySessionId(sessionId)
        await deleteTenant(sessionId)
        if (curSession.value?.id === sessionId) {
          setCurSession(null)
        }
      } catch (error) {
        console.error(error)
        ElMessage.error(error as Error)
      }
      loading.close()
    })
  }

  // 构建新会话对象
  function buildNewSession() {
    const newSession = {
      id: getUUID(),
      title: '新的会话',
      turn: 0,
      config: {
        apiKey: '',
        baseUrl: '',
        sysPrompt: '',
        instructionPrompt: '',
        summaryPrompt:
          '请把之前的对话内容进行总结，生成md格式的摘要，仅返回摘要内容，不要包含任何其他内容',
        queryExtractPrompt: '',
        queryToolPrompt: '',
        firstAiMsg: '',
        writerModel: {
          model: '',
          temperature: 0.9,
          maxTokens: 8192,
        },
        summaryModel: {
          model: '',
          temperature: 0.5,
          maxTokens: 8192,
        },
        retrieverModel: {
          model: '',
          temperature: 0.5,
          maxTokens: 8192,
        },
        topK: 5,
        windowMsgNum: 50,
        history: 10,
        retrieverMode: RetrieverMode.SIMILARITY,
        retrieverCategory: [RetrieverCategory.SUMMARY],
        enableRetriever: true,
        enableSummary: true,
        updateSummary: false,
        searchMode: SearchMode.AGENT,
        summaryTurn: 5,
        distance: 0.5,
        summaryNum: 10,
      },
      lastMsgTime: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    return newSession
  }

  // 创建开场白消息（内容为空的话会被过滤掉，表示不启用开场白）
  async function createFirstAiMsg() {
    const firstAiMsgId = 'firstAiMsg-' + curSession.value!.id
    const firstAiMsg = buildAiMessage(curSession.value!.id, 0, '', false, firstAiMsgId)
    await addMessage(firstAiMsg)
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
