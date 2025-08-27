import { toRaw } from 'vue'
import { liveQuery, Dexie } from 'dexie'
import { useObservable } from '@vueuse/rxjs'
import { from } from 'rxjs'
import { db } from './index'
import { getUUID } from '@/utils'
import { Role } from '@/schema/enum'
import type { Message, MessagePatch } from '@/schema/chat'

// 新增消息
function addMessage(message: Omit<Message, 'id'>) {
  return db.messages.add(toRaw(message))
}

// 更新消息
function putMessage(message: Message) {
  return db.messages.put(toRaw(message))
}

// 更新消息
function updateMessage(id: string, patch: MessagePatch) {
  return db.messages.update(id, toRaw(patch))
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
function getMessagesBySessionIdObservable(sessionId: string | undefined, limit: number = 5) {
  console.log('sessionId', sessionId)
  if (!sessionId) {
    // sessionId 不存在时返回空数组的响应式对象
    return useObservable(from(Promise.resolve<Message[]>([])))
  }
  return useObservable(
    from(
      liveQuery(() =>
        db.messages
          .where('[sessionId+createdAt]')
          .between([sessionId, Dexie.minKey], [sessionId, Dexie.maxKey])
          .and((msg) => typeof msg.content === 'string' && msg.content.trim() !== '')
          .reverse()
          .limit(limit)
          .toArray(),
      ),
    ),
  )
}

// 获取指定会话的最新limit条消息，按createdAt倒序（最新在前）
function getMessagesByLimit(sessionId: string, limit: number) {
  // 这里需要reverse，保证最新的在前，便于和分页方向统一
  return db.messages
    .where('[sessionId+createdAt]')
    .between([sessionId, Dexie.minKey], [sessionId, Dexie.maxKey])
    .and((msg) => typeof msg.content === 'string' && msg.content.trim() !== '')
    .reverse()
    .limit(limit)
    .toArray()
}

// 游标分页：获取下一页（更旧的消息），不包含游标对应的数据
async function nextPage(sessionId: string, beforeCursor: number, pageSize: number) {
  // 必须严格小于游标，排除游标对应数据
  const res = await db.messages
    .where('[sessionId+createdAt]')
    .between(
      [sessionId, Dexie.minKey],
      [sessionId, beforeCursor],
      false, // 包含下界
      false, // exclude upper，严格小于游标
    )
    .and((msg) => typeof msg.content === 'string' && msg.content.trim() !== '')
    .reverse() // 保证顺序与首页一致（最新在前）
    .limit(pageSize)
    .toArray()

  return res
}

// 游标分页：获取上一页（更新的消息），不包含游标对应的数据
async function prevPage(sessionId: string, afterCursor: number, pageSize: number) {
  // 必须严格大于游标，排除游标对应数据
  const res = await db.messages
    .where('[sessionId+createdAt]')
    .between(
      [sessionId, afterCursor],
      [sessionId, Dexie.maxKey],
      false, // exclude lower，严格大于游标
      false, // 包含上界
    )
    .and((msg) => typeof msg.content === 'string' && msg.content.trim() !== '')
    .limit(pageSize)
    .toArray()

  // 由于是createdAt升序，需要reverse成倒序（最新在前）
  return res.reverse()
}

function getMessageCount(sessionId: string) {
  return db.messages
    .where('sessionId')
    .equals(sessionId)
    .and((msg) => typeof msg.content === 'string' && msg.content.trim() !== '')
    .count()
}

// 删除该会话下的所有消息
function deleteMessagesBySessionId(sessionId: string) {
  return db.messages.where('sessionId').equals(sessionId).delete()
}

// 根据id删除消息
function deleteMessageById(id: string) {
  return db.messages.delete(id)
}

function buildMessage(
  sessionId: string,
  turn: number,
  role: Role,
  content: string,
  loading: boolean = false,
  id: string = getUUID(),
): Message {
  return {
    id,
    sessionId,
    turn,
    role,
    content,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    loading,
  }
}

function buildAiMessage(
  sessionId: string,
  turn: number,
  content: string,
  loading: boolean = false,
  id?: string,
): Message {
  return buildMessage(sessionId, turn, Role.AI, content, loading, id)
}

function buildUserMessage(sessionId: string, turn: number, content: string, id?: string): Message {
  return buildMessage(sessionId, turn, Role.USER, content, false, id)
}

export {
  addMessage,
  putMessage,
  updateMessage,
  deleteMessage,
  getMessage,
  getMessages,
  getMessagesBySessionId,
  getMessagesBySessionIdObservable,
  deleteMessagesBySessionId,
  getMessagesByLimit,
  prevPage,
  nextPage,
  getMessageCount,
  deleteMessageById,
  buildMessage,
  buildAiMessage,
  buildUserMessage,
}
