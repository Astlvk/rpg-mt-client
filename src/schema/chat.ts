enum Model {
  GPT35T = 'gpt-3.5-turbo',
  GPT35T1106 = 'gpt-3.5-turbo-1106',
  GPT4T = 'gpt-4-1106-preview',
}

enum Role {
  SYSTEM = 'system',
  AI = 'assistant',
  USER = 'user',
}

interface BaseEntity {
  createdAt: number // 创建时间，时间戳
  updatedAt: number // 更新时间，时间戳
}

interface SessionConfig {
  kbId: string // 知识库id
  kbName: string // 知识库名称
  topK: number // 选择多少
  history: number // 携带的历史消息数量
  temperature: number // 温度
  model: string // 模型
  maxTokens: number // 最大token
}

interface Session extends BaseEntity {
  id: string // uuid
  title: string // 标题
  avatar?: string // 头像
  config?: SessionConfig // 会话配置
  lastMsg?: string // 最后消息
  lastMsgTime?: string // 最后消息时间，时间戳
}

interface Message extends BaseEntity {
  id: string // uuid
  sessionId: string // 会话id
  turn: number // 严格递增（0,1,2…）
  role: Role
  content: string // 文本（可选：分块/压缩）
  final?: boolean // 流式生成中：false；完成后：true
}

export type { Message, Session }

export { Model, Role }
