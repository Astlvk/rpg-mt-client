interface SummaryItem {
  uuid: string
  summary: string
  created_at: string
  updated_at: string
  score?: number
  distance?: number
}

export type { SummaryItem }
