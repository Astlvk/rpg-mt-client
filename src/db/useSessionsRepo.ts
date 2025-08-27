import { toRaw } from 'vue'
import { liveQuery } from 'dexie'
import { db } from './index'
import { useObservable } from '@vueuse/rxjs'
import { from } from 'rxjs'
import type { Session, SessionPatch } from '@/schema/chat'

// 按照createdAt时间升序排序
const sessions = useObservable(from(liveQuery(() => db.sessions.orderBy('lastMsgTime').toArray())))

function addSession(session: Session) {
  return db.sessions.add(toRaw(session))
}

function putSession(session: Session) {
  return db.sessions.put(toRaw(session))
}

function updateSession(id: string, patch: SessionPatch) {
  return db.sessions.update(id, toRaw(patch))
}

function deleteSession(id: string) {
  return db.sessions.delete(id)
}

function getSession(id: string) {
  return db.sessions.get(id)
}

/**
 * 获取所有会话
 * @param reverse 是否反转，默认false（正序），按照时间升序
 * @returns Promise<Session[]>
 */
function getSessions(reverse: boolean = false) {
  return db.sessions
    .orderBy('createdAt')
    .toArray()
    .then((arr) => (reverse ? arr.reverse() : arr))
}

// 获取会话数
function getSessionCount() {
  return db.sessions.count()
}

/**
 * 获取第n条会话数据（从0开始），基于最后消息时间升序排序
 * @param index 索引
 * @returns Promise<Session | undefined>
 */
function getSessionByIndex(index: number): Promise<Session | undefined> {
  return db.sessions.orderBy('lastMsgTime').offset(index).limit(1).first()
}

export {
  sessions,
  addSession,
  putSession,
  updateSession,
  deleteSession,
  getSession,
  getSessions,
  getSessionCount,
  getSessionByIndex,
}
