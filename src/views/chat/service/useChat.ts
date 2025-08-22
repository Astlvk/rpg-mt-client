import type { Ref } from 'vue'
import { type Message } from '@/schema/chat'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { getCurSession, setLastAiMsg, scrollToBottom } from './workspace'
import { buildAiMessage, addMessage } from '@/db/useMessagesRepo'
import { updateSession } from '@/db/useSessionsRepo'

async function chatWriter(messages: Message[]) {
  try {
    const curSession = getCurSession()
    if (curSession.value) {
      // 生成ai回复的占位内容
      const lastAiMsg = setLastAiMsg(buildAiMessage(curSession.value.id, 0, '', true))

      const msg = messages.slice(-curSession.value.config.history)

      const url = 'http://127.0.0.1:3307/rpg-mt/chat/writer'
      fetchEventSource(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        openWhenHidden: true,
        body: JSON.stringify({
          model: curSession.value.config.writerModel.model,
          sys_prompt: curSession.value.config.sysPrompt,
          messages: msg,
          temperature: curSession.value.config.writerModel.temperature,
          max_tokens: curSession.value.config.writerModel.maxTokens,
          streaming: true,
          instruction: curSession.value.config.instructionPrompt,
        }),
        async onopen(response) {
          console.log('open', response)
          if (response.status === 401) {
            throw new Error('认证无效或者已过期，请重新登录。')
          }
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
            lastAiMsg.value.content += data.content
            scrollToBottom()
          }
        },
        onerror(err) {
          console.error(err)
          throw err
        },
        async onclose() {
          console.log('close')
          await addLastAiMsgToDb(lastAiMsg)
          await updateCurSessionTurn()
        },
      })
    }
  } catch (error) {
    console.error(error)
  }
}

async function addLastAiMsgToDb(lastAiMsg: Ref<Message | null>) {
  if (lastAiMsg.value) {
    lastAiMsg.value.loading = false
    lastAiMsg.value.updatedAt = Date.now()
    const newMsg = { ...lastAiMsg.value }
    setLastAiMsg(null)
    await addMessage(newMsg)
  }
}

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

export { chatWriter }
