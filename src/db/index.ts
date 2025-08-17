import Dexie, { type EntityTable } from 'dexie'
import type { Session } from '@/schema/db'

const dbName = 'rpg-mt-db'
const dbVersion = 1
const dbSchema = {
  sessions: '&id, title, createdAt, updatedAt',
}

const db = new Dexie(dbName) as Dexie & {
  sessions: EntityTable<Session, 'id'>
}
db.version(dbVersion).stores(dbSchema)

export { db }
