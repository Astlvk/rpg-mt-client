import { Role, RetrieverMode, RetrieverCategory, SearchMode } from './enum'
import type { queryInfo } from './summary'

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
  windowMsgNum: number // 窗口消息数量
  history: number // 携带的历史消息数量
  topK: number // 召回数量
  distance: number // 距离
  sysPrompt: string // 系统提示词
  instructionPrompt: string // 指令提示词
  summarySystemPrompt: string // 摘要系统提示词
  summaryPrompt: string // 摘要提示词
  summaryMergeSystemPrompt: string // 更新摘要的系统提示词
  summaryMergePrompt: string // 更新摘要的提示词
  summaryDistance: number // 触发更新摘要的相似距离
  summaryTopK: number // 获取需要更新摘要的数量
  firstAiMsg: string // 第一轮ai消息（开场白）
  queryExtractPrompt: string // 搜索词提取提示词
  queryToolPrompt: string // 搜索工具提示词
  retrieverMode: RetrieverMode // 召回方式
  retrieverCategory: RetrieverCategory[] // 召回类别
  enableRetriever: boolean // 启用召回
  enableSummary: boolean // 启用摘要
  updateSummary: boolean // 更新摘要
  searchMode: SearchMode // 检索方式，强制检索，agent检索
  summaryTurn: number // 摘要轮数，1为每轮都启用，2为每两轮启用一次，以此类推
  summaryNum: number // 摘要数量
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
  turn: number // 当前对话轮次
  config: SessionConfig
}

interface UsageMetadata {
  inputTokens?: number // 输入token
  outputTokens?: number // 输出token
  totalTokens?: number // 总token
}

interface Message extends BaseEntity {
  id: string // uuid
  sessionId: string // 会话id
  turn: number // 当前对话轮次
  role: Role
  content: string // 文本（可选：分块/压缩）
  docs?: queryInfo[] // 检索到的摘要
  usageMetadata?: UsageMetadata // 使用元数据
  loading?: boolean // 流式生成中：true；完成后：false
}

type MessagePatch = Partial<Omit<Message, 'id'>> & { updatedAt: number }

type SessionPatch = Partial<Omit<Session, 'id'>> & { updatedAt: number }

export type { Message, Session, SessionForm, MessagePatch, SessionPatch, ModelConfigType }
