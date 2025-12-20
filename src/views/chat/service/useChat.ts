import { markRaw, nextTick, type Ref } from 'vue'
import { type Message } from '@/schema/chat'
import { generateSummary } from '@/api/base.api'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { getCurSession, setLastAiMsg, setSummaryLoading, scrollToBottom } from './workspace'
import { buildAiMessage, addMessage } from '@/db/useMessagesRepo'
import { updateSession } from '@/db/useSessionsRepo'
import { ElMessage } from 'element-plus'

async function chatWriter(messages: Message[]) {
  try {
    const curSession = getCurSession()
    if (curSession.value) {
      // 生成ai回复的占位内容
      const lastAiMsg = setLastAiMsg(buildAiMessage(curSession.value.id, 0, '', true))
      scrollToBottom()

      const msgs = messages.slice(-curSession.value.config.history)

      const url = `${import.meta.env.VITE_APP_BASE_URL}/rpg-mt/chat/writer-agent`
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
          instruction_prompt: curSession.value.config.instructionPrompt,
          // 检索相关参数
          tenant_name: curSession.value.id,
          retriever_mode: curSession.value.config.retrieverMode,
          distance: curSession.value.config.distance,
          top_k: curSession.value.config.topK,
          query_tool_prompt: curSession.value.config.queryToolPrompt,
        }),
        async onopen(response) {
          console.log('open', response)
          if (response.status !== 200) {
            throw new Error('Bad response status: ' + response.status)
          }
        },
        onmessage(ev) {
          // console.log('message', ev)
          // 接口返回值里有空字符串的情况
          // 比如：message {data: '', event: '', id: '', retry: undefined}
          if (ev.data === '') {
            return
          }
          const data = JSON.parse(ev.data)
          if (lastAiMsg.value) {
            if (data.content) {
              lastAiMsg.value.content += data.content
              scrollToBottom()
            }
            if (data.docs) {
              lastAiMsg.value.docs = markRaw(data.docs)
            }
            if (data.usageMetadata) {
              lastAiMsg.value.usageMetadata = markRaw(data.usageMetadata)
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
          try {
            // 持久化最后一条ai消息，并更新session轮次、最后消息时间
            await addLastAiMsgToDb(lastAiMsg)
            await summary(messages)
          } catch (error) {
            console.error(error)
            ElMessage.error('持久化或摘要失败，详情请查看控制台输出')
            setLastAiMsg(null)
          }
        },
      })
    }
  } catch (error) {
    console.error(error)
  }
}

// 添加最后一条ai消息（占位用消息）到数据库
async function addLastAiMsgToDb(lastAiMsg: Ref<Message | null>) {
  const curSession = getCurSession()
  if (curSession.value) {
    // 更新session轮次
    curSession.value.turn++

    if (lastAiMsg.value) {
      lastAiMsg.value.loading = false
      lastAiMsg.value.updatedAt = Date.now()
      lastAiMsg.value.turn = curSession.value.turn
      // 这里构建新的对象，避免响应式对无法存入数据库
      const newMsg = { ...lastAiMsg.value }
      await addMessage(newMsg)
      // emmm，这里为了不闪回，先setTimeout，再nextTick
      // 虽然不严谨，但可以达到效果，成本很低
      // 懒得再去重写列表渲染结构，维护内存列表了
      // 成本太高
      setTimeout(() => {
        nextTick(() => {
          setLastAiMsg(null)
        })
      }, 0)
    }

    // 更新session的最后消息时间
    curSession.value.lastMsgTime = Date.now()
    await updateSession(curSession.value.id, {
      turn: curSession.value.turn,
      lastMsgTime: curSession.value.lastMsgTime,
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

      // 截取需要摘要的最后几条消息
      const msgs = messages.slice(-curSession.value.config.summaryNum)
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
        summary_system_prompt: curSession.value.config.summarySystemPrompt,
        summary_prompt: curSession.value.config.summaryPrompt,
        tenant_name: curSession.value.id,
        turn: curTurn,
        update_summary: curSession.value.config.updateSummary,
        summary_distance: curSession.value.config.summaryDistance,
        summary_top_k: curSession.value.config.summaryTopK,
        summary_merge_system_prompt: curSession.value.config.summaryMergeSystemPrompt,
        summary_merge_prompt: curSession.value.config.summaryMergePrompt,
      })
    } catch (error) {
      throw error
    } finally {
      setSummaryLoading(false)
    }
  }
}

// 主动摘要
async function activeSummary(messages: Message[]) {
  const curSession = getCurSession()
  if (curSession.value) {
    setSummaryLoading(true)
    try {
      // 截取需要摘要的最后几条消息
      const msgs = messages.slice(-curSession.value.config.summaryNum)
      if (msgs.length === 0) {
        return
      }

      console.log('主动摘要中....')

      await generateSummary({
        model: curSession.value.config.summaryModel.model,
        api_key: curSession.value.config.apiKey,
        base_url: curSession.value.config.baseUrl,
        sys_prompt: curSession.value.config.sysPrompt,
        messages: msgs,
        temperature: curSession.value.config.summaryModel.temperature,
        max_tokens: curSession.value.config.summaryModel.maxTokens,
        streaming: true,
        summary_system_prompt: curSession.value.config.summarySystemPrompt,
        summary_prompt: curSession.value.config.summaryPrompt,
        tenant_name: curSession.value.id,
        turn: curSession.value.turn,
        update_summary: curSession.value.config.updateSummary,
        summary_distance: curSession.value.config.summaryDistance,
        summary_top_k: curSession.value.config.summaryTopK,
        summary_merge_system_prompt: curSession.value.config.summaryMergeSystemPrompt,
        summary_merge_prompt: curSession.value.config.summaryMergePrompt,
      })
    } catch (error) {
      throw error
    } finally {
      setSummaryLoading(false)
    }
  }
}

export { chatWriter, activeSummary }
