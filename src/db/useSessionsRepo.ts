import { liveQuery } from 'dexie'
import { db } from './index'
import { useObservable } from '@vueuse/rxjs'
import { from } from 'rxjs'
import type { Session } from '@/schema/db'

export function useSessionsRepo() {
  const sessions = useObservable(from(liveQuery(() => db.sessions.toArray())))

  function addSession(session: Session) {
    db.sessions.add(session)
  }

  function updateSession(session: Session) {
    db.sessions.put(session)
  }

  function deleteSession(id: string) {
    db.sessions.delete(id)
  }

  function getSession(id: string) {
    return db.sessions.get(id)
  }

  function getSessions() {
    return db.sessions.toArray()
  }

  return {
    sessions,
    addSession,
    updateSession,
    deleteSession,
    getSession,
    getSessions,
  }
}
