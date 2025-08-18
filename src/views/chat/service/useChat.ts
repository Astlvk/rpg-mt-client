import { fetchEventSource } from '@microsoft/fetch-event-source'

async function chatAI(inputPrompt: string) {
  try {
    // 获取当前session的引用（发送sse请求时当前session可能会切换，因此这里需要直接获取触发sse的session引用）
    const session = curSession.value
    if (session !== undefined) {
      session.msgLoading = true
      session.messages.push({
        role: Role.USER,
        content: inputPrompt,
      })
      // 对ai的回答先进行占位
      session.messages.push({
        role: Role.AI,
        content: '',
      })
      const url = '/agent/cs_v2_w'
      fetchEventSource(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        openWhenHidden: true,
        body: JSON.stringify({
          // ...
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
          session.msgLoading = false
          console.log(ev)
          // 接口返回值里有空字符串的情况
          if (ev.data === '') {
            return
          }
          const data = JSON.parse(ev.data)
          const messages = session.messages
          const el = messages[messages.length - 1]
          el.content += data.content
          scrollToBottom(chatMsgRef.value)
        },
        onerror(err) {
          console.error(err)
          const messages = session.messages
          const el = messages[messages.length - 1]
          el.content = err.message || '网络请求错误'
          throw err
        },
        async onclose() {
          console.log('close')
        },
      })
    }
  } catch (error) {
    console.error(error)
  }
}
