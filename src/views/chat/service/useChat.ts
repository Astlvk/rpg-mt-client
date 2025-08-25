import { markRaw, type Ref } from 'vue'
import { type Message } from '@/schema/chat'
import { generateSummary } from '@/api/base.api'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import {
  getCurSession,
  setLastAiMsg,
  setSummaryLoading,
  throttledScrollToBottom,
} from './workspace'
import { buildAiMessage, addMessage } from '@/db/useMessagesRepo'
import { updateSession } from '@/db/useSessionsRepo'
import { ElMessage } from 'element-plus'

async function chatWriter(messages: Message[]) {
  try {
    const curSession = getCurSession()
    if (curSession.value) {
      // 生成ai回复的占位内容
      const lastAiMsg = setLastAiMsg(buildAiMessage(curSession.value.id, 0, '', true))

      const msgs = messages.slice(-curSession.value.config.history)

      const url = 'http://127.0.0.1:3307/rpg-mt/chat/writer-agent'
      fetchEventSource(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        openWhenHidden: true,
        body: JSON.stringify({
          api_key: curSession.value.config.apiKey,
          base_url: curSession.value.config.baseUrl,
          model: curSession.value.config.writerModel.model,
          sys_prompt: curSession.value.config.sysPrompt,
          messages: msgs,
          temperature: curSession.value.config.writerModel.temperature,
          max_tokens: curSession.value.config.writerModel.maxTokens,
          streaming: true,
          instruction: curSession.value.config.instructionPrompt,
          // 检索相关参数
          tenant_name: curSession.value.id,
          retriever_mode: curSession.value.config.retrieverMode,
          distance: curSession.value.config.distance,
          top_k: curSession.value.config.topK,
        }),
        async onopen(response) {
          console.log('open', response)
          if (response.status !== 200) {
            throw new Error('Bad response status: ' + response.status)
          }
        },
        onmessage(ev) {
          console.log('message', ev)
          // 接口返回值里有空字符串的情况
          // 比如：message {data: '', event: '', id: '', retry: undefined}
          if (ev.data === '') {
            return
          }
          const data = JSON.parse(ev.data)
          if (lastAiMsg.value) {
            if (data.content) {
              lastAiMsg.value.content += data.content
              throttledScrollToBottom()
            }
            if (data.docs) {
              lastAiMsg.value.docs = markRaw(data.docs)
            }
          }
        },
        onerror(err) {
          console.error('error', err)
          ElMessage.error('AI回复失败，详情请查看控制台输出')
          setLastAiMsg(null)
          throw err
        },
        async onclose() {
          console.log('close')
          await addLastAiMsgToDb(lastAiMsg)
          await updateCurSessionTurn()
          await summary(messages)
        },
      })
    }
  } catch (error) {
    console.error(error)
  }
}

// 添加最后一条ai消息（占位用消息）到数据库
async function addLastAiMsgToDb(lastAiMsg: Ref<Message | null>) {
  if (lastAiMsg.value) {
    lastAiMsg.value.loading = false
    lastAiMsg.value.updatedAt = Date.now()
    // 这里构建新的对象，避免响应式对无法存入数据库
    const newMsg = { ...lastAiMsg.value }
    setLastAiMsg(null)
    await addMessage(newMsg)
  }
  const curSession = getCurSession()
  // 更新session的最后消息时间
  if (curSession.value) {
    curSession.value.lastMsgTime = Date.now()
    await updateSession(curSession.value.id, {
      lastMsgTime: curSession.value.lastMsgTime,
      updatedAt: Date.now(),
    })
  }
}

// 更新对话轮数（ai返回消息后，对话轮数+1）
async function updateCurSessionTurn() {
  const curSession = getCurSession()
  if (curSession.value) {
    curSession.value.turn++
    await updateSession(curSession.value.id, {
      turn: curSession.value.turn,
      updatedAt: Date.now(),
    })
  }
}

// 摘要
async function summary(messages: Message[]) {
  const curSession = getCurSession()
  if (curSession.value) {
    setSummaryLoading(true)

    try {
      const enableSummary = curSession.value.config.enableSummary
      const curTurn = curSession.value.turn
      const summaryTurn = curSession.value.config.summaryTurn
      const allowSummary = curTurn % summaryTurn === 0

      if (!enableSummary) {
        return
      }

      if (curTurn === 0 || !allowSummary) {
        return
      }

      const msgs = messages.slice(-curSession.value.config.history)
      if (msgs.length === 0) {
        return
      }

      console.log('摘要中....')

      await generateSummary({
        model: curSession.value.config.summaryModel.model,
        api_key: curSession.value.config.apiKey,
        base_url: curSession.value.config.baseUrl,
        sys_prompt: curSession.value.config.sysPrompt,
        messages: msgs,
        temperature: curSession.value.config.summaryModel.temperature,
        max_tokens: curSession.value.config.summaryModel.maxTokens,
        streaming: true,
        summary_prompt: curSession.value.config.summaryPrompt,
        tenant_name: curSession.value.id,
      })
    } catch (error) {
      throw error
    } finally {
      setSummaryLoading(false)
    }
  }
}

export { chatWriter }
