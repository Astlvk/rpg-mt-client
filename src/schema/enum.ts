enum OpenAIModel {
  GPT5 = 'gpt-5',
  GPT5_MINI = 'gpt-5-mini',
  GPT5_NANO = 'gpt-5-nano',
  GPT41 = 'gpt-4.1',
  GPT41_MINI = 'gpt-4.1-mini',
  GPT41_NANO = 'gpt-4.1-nano',
}

enum DeepSeekModel {
  DEEPSEEK_V4_FLASH = 'deepseek-v4-flash',
  DEEPSEEK_V4_PRO = 'deepseek-v4-pro',
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

// 摘要类型
enum SummaryType {
  CHARACTER = 'character',
  SUMMARY = 'summary',
  OTHER = 'other',
}

export {
  OpenAIModel,
  DeepSeekModel,
  Role,
  RetrieverMode,
  RetrieverCategory,
  SearchMode,
  SummaryType,
}
