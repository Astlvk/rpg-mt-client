enum Model {
  GPT35T = 'gpt-3.5-turbo',
  GPT35T1106 = 'gpt-3.5-turbo-1106',
  GPT4T = 'gpt-4-1106-preview',
}

enum ZhipuAIModel {
  GLM45V = 'glm-4.5v',
  GLM45 = 'glm-4.5',
  GLM45X = 'glm-4.5-x',
  GLM45AIR = 'glm-4.5-air',
  GLM45AIRX = 'glm-4.5-airx',
  GLM45FLASH = 'glm-4.5-flash',
}

enum DeepSeekModel {
  DEEPSEEK_CHAT = 'deepseek-chat',
  DEEPSEEK_REASONER = 'deepseek-reasoner',
}

enum Role {
  SYSTEM = 'system',
  AI = 'assistant',
  USER = 'user',
}

// 召回方式，语义搜索，混合检索
enum RetrieverMode {
  SIMILARITY = 'similarity',
  HYBRID = 'hybrid',
}

// 召回类别
enum RetrieverCategory {
  // 摘要
  SUMMARY = 'summary',
  // 词条
  TERM = 'term',
}

// 检索方式，强制检索，agent检索
enum SearchMode {
  FORCE = 'force',
  AGENT = 'agent',
}

export { Model, ZhipuAIModel, DeepSeekModel, Role, RetrieverMode, RetrieverCategory, SearchMode }
