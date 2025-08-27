import Dexie, { type EntityTable } from 'dexie'
import 'dexie-export-import'
import { saveAs } from 'file-saver'
import dayjs from 'dayjs'
import { ElLoading, ElMessage } from 'element-plus'
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

async function exportDB(fileName: string | null = null) {
  const loading = ElLoading.service({
    text: '导出中...',
  })
  try {
    // 只导出某些表：加 filter: (name) => name === 'messages'
    const blob = await db.export({ prettyJson: true })
    const filename = fileName || `rpg-mt-backup-${dayjs().format('YYYYMMDDHHmmss')}.db`
    saveAs(blob, filename)
  } catch (error) {
    console.error(error)
    ElMessage.error('导出失败：' + (error as Error).message)
    throw error
  }
  loading.close()
}

async function importDB(blob: Blob, clearTablesBeforeImport = false, overwriteValues = false) {
  await db.import(blob, { clearTablesBeforeImport, overwriteValues })
}

export { db, exportDB, importDB }
