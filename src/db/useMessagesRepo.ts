import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'
import { from } from 'rxjs'
import { db } from './index'
import { getUUID } from '@/utils'
import { Role, type Message } from '@/schema/chat'

export function useMessagesRepo() {
  // 按照createdAt时间升序排序
  const messages = useObservable(from(liveQuery(() => db.messages.orderBy('createdAt').toArray())))

  // 新增消息
  function addMessage(message: Message) {
    return db.messages.add(message)
  }

  // 更新消息
  function updateMessage(message: Message) {
    return db.messages.put(message)
  }

  // 删除消息
  function deleteMessage(id: string) {
    return db.messages.delete(id)
  }

  // 获取消息
  function getMessage(id: string) {
    return db.messages.get(id)
  }

  /**
   * 获取所有消息
   * @param reverse 是否反转，默认false（正序），按照时间升序
   * @returns Promise<Message[]>
   */
  function getMessages(reverse: boolean = false) {
    return db.messages
      .orderBy('createdAt')
      .toArray()
      .then((arr) => (reverse ? arr.reverse() : arr))
  }

  /**
   * 根据sessionId获取该会话下的所有消息，按createdAt升序排序
   * @param sessionId 会话ID
   * @returns Promise<Message[]>
   */
  function getMessagesBySessionId(sessionId: string) {
    return db.messages.where('sessionId').equals(sessionId).sortBy('createdAt')
  }

  // 获取响应式的消息
  function getMessagesBySessionIdObservable(sessionId: string | undefined) {
    console.log('sessionId', sessionId)
    if (!sessionId) {
      // sessionId 不存在时返回空数组的响应式对象
      return useObservable(from(Promise.resolve<Message[]>([])))
    }
    return useObservable(
      from(liveQuery(() => db.messages.where('sessionId').equals(sessionId).sortBy('createdAt'))),
    )
  }

  // 删除该会话下的所有消息
  function deleteMessagesBySessionId(sessionId: string) {
    return db.messages.where('sessionId').equals(sessionId).delete()
  }

  function buildMessage(sessionId: string, turn: number, role: Role, content: string): Message {
    return {
      id: getUUID(),
      sessionId,
      turn,
      role,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  }

  function buildAiMessage(sessionId: string, turn: number, content: string): Message {
    return buildMessage(sessionId, turn, Role.AI, content)
  }

  function buildUserMessage(sessionId: string, turn: number, content: string): Message {
    return buildMessage(sessionId, turn, Role.USER, content)
  }

  return {
    messages,
    addMessage,
    updateMessage,
    deleteMessage,
    getMessage,
    getMessages,
    getMessagesBySessionId,
    getMessagesBySessionIdObservable,
    deleteMessagesBySessionId,
    buildMessage,
    buildAiMessage,
    buildUserMessage,
  }
}
