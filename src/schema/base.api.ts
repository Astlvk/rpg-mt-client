import type { Message } from './chat'

interface SummaryRequest {
  model: string
  api_key: string
  base_url: string
  sys_prompt: string
  messages: Message[]
  temperature: number
  max_tokens: number
  streaming: boolean
  summary_prompt: string
  tenant_name: string
}

interface SummaryResponse {
  summary: string
}

export type { SummaryRequest, SummaryResponse }
