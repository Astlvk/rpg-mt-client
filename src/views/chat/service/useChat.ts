import type { Ref } from 'vue'
import { type Message } from '@/schema/chat'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { setLastAiMsg, scrollToBottom } from './workspace'
import { buildAiMessage, addMessage } from '@/db/useMessagesRepo'
import { getCurSession } from './workspace'

async function chatWriter(messages: Message[]) {
  try {
    const curSession = getCurSession()
    if (curSession.value) {
      // 生成ai回复的占位内容
      const lastAiMsg = setLastAiMsg(buildAiMessage(curSession.value.id, 0, '', true))

      const url = 'http://127.0.0.1:3307/rpg-mt/chat/writer'
      fetchEventSource(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        openWhenHidden: true,
        body: JSON.stringify({
          model: 'glm-4.5-flash',
          sys_prompt: '你是一个乐于助人的智能助理。',
          messages,
          temperature: 0.9,
          max_tokens: 4096,
          streaming: true,
          instruction: '请根据以下剧情，生成一个剧情',
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
          addLastAiMsgToDb(lastAiMsg)
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

export { chatWriter }
