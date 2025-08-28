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
  summary_prompt: string
  tenant_name: string
  turn?: number
}

export type { ChatBaseModel, SummaryRequest, RespModel }
