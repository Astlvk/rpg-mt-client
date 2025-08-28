// 创作接口返回的检索结果
interface queryInfo {
  query: string
  summaries: SummaryItem[]
}

interface SummaryItem {
  uuid: string
  summary: string
  distance?: number
  score?: number
  turn?: number
  created_at: string
  updated_at: string
}

export type { SummaryItem, queryInfo }
