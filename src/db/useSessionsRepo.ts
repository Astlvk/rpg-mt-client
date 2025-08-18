import { liveQuery } from 'dexie'
import { db } from './index'
import { useObservable } from '@vueuse/rxjs'
import { from } from 'rxjs'
import type { Session } from '@/schema/chat'

export function useSessionsRepo() {
  // 按照createdAt时间升序排序
  const sessions = useObservable(from(liveQuery(() => db.sessions.orderBy('createdAt').toArray())))

  function addSession(session: Session) {
    return db.sessions.add(session)
  }

  function updateSession(session: Session) {
    return db.sessions.put(session)
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
   * 获取第n条会话数据（从0开始），基于时间升序排序
   * @param index 索引
   * @returns Promise<Session | undefined>
   */
  function getSessionByIndex(index: number): Promise<Session | undefined> {
    return db.sessions.orderBy('createdAt').offset(index).limit(1).first()
  }

  return {
    sessions,
    addSession,
    updateSession,
    deleteSession,
    getSession,
    getSessions,
    getSessionCount,
    getSessionByIndex,
  }
}
