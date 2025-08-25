import Dexie, { type EntityTable } from 'dexie'
import type { Session, Message } from '@/schema/chat'

const dbName = 'rpg-mt-db'
const dbVersion = 1
const dbSchema = {
  sessions: '&id, title, createdAt, updatedAt, lastMsgTime',
  messages:
    '&id, sessionId, turn, role, createdAt, updatedAt, [sessionId+turn], [sessionId+createdAt]',
}

const db = new Dexie(dbName) as Dexie & {
  sessions: EntityTable<Session, 'id'>
  messages: EntityTable<Message, 'id'>
}
db.version(dbVersion).stores(dbSchema)

export { db }
