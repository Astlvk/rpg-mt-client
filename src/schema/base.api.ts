import type { Message } from './chat'

// 分页数据接口响应模型
interface RespModel<T> {
  total: number
  data: T[]
}

interface ChatBaseModel {
  model: string
  api_key: string
  base_url: string
  sys_prompt: string
  messages: Message[]
  temperature: number
  max_tokens: number
  streaming: boolean
}

interface SummaryRequest extends ChatBaseModel {
  summary_system_prompt: string
  summary_prompt: string
  tenant_name: string
  turn?: number
  update_summary: boolean
  summary_distance: number
  summary_top_k: number
  summary_merge_system_prompt: string
  summary_merge_prompt: string
}

export type { ChatBaseModel, SummaryRequest, RespModel }
