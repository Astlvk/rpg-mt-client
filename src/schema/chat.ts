import { Role, RetrieverType, RetrieverCategory, SearchMode } from './enum'

interface BaseEntity {
  createdAt: number // 创建时间，时间戳
  updatedAt: number // 更新时间，时间戳
}

type ModelConfigType = 'writerModel' | 'retrieverModel' | 'summaryModel'

interface ModelConfig {
  model: string // 模型
  apiKey?: string // api key
  baseUrl?: string // base url
  temperature: number // 温度
  maxTokens: number // 最大token
}

interface SessionConfig {
  apiKey: string // api key
  baseUrl: string // base url
  writerModel: ModelConfig
  summaryModel: ModelConfig
  retrieverModel: ModelConfig
  history: number // 携带的历史消息数量
  topK: number // 召回数量
  distance: number // 距离
  sysPrompt: string // 系统提示词
  instructionPrompt: string // 指令提示词
  summaryPrompt: string // 摘要提示词
  queryExtractPrompt: string // 搜索词提取提示词
  retrieverType: RetrieverType // 召回方式
  retrieverCategory: RetrieverCategory[] // 召回类别
  enableRetriever: boolean // 启用召回
  enableSummary: boolean // 启用摘要
  searchMode: SearchMode // 检索方式，强制检索，agent检索
  summaryTurn: number // 摘要轮数，1为每轮都启用，2为每两轮启用一次，以此类推
}

interface Session extends BaseEntity {
  id: string // uuid
  title: string // 标题
  avatar?: string // 头像
  turn: number // 当前对话轮次
  config: SessionConfig // 会话配置
  lastMsg?: string // 最后消息
  lastMsgTime?: number // 最后消息时间，时间戳
}

interface SessionForm {
  title: string // 标题
  config: SessionConfig
}

interface Message extends BaseEntity {
  id: string // uuid
  sessionId: string // 会话id
  turn: number // 当前对话轮次
  role: Role
  content: string // 文本（可选：分块/压缩）
  loading?: boolean // 流式生成中：true；完成后：false
}

type MessagePatch = Partial<Omit<Message, 'id'>> & { updatedAt?: number }

type SessionPatch = Partial<Omit<Session, 'id'>> & { updatedAt?: number }

export type { Message, Session, SessionForm, MessagePatch, SessionPatch, ModelConfigType }
