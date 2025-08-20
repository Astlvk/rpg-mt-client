import type { SessionForm } from '@/schema/chat'
import { ref, reactive } from 'vue'
import { ZhipuAIModel, RetrieverType, RetrieverCategory, SearchMode } from '@/schema/enum'
import { getCurSession } from '../../service/workspace'

export function useSessionConfig() {
  const curSession = getCurSession()

  const activeNames = ref(['base', 'model', 'summary', 'retriever'])

  const modelOptions = [
    { label: 'GLM-4.5V', value: ZhipuAIModel.GLM45V },
    { label: 'GLM-4.5', value: ZhipuAIModel.GLM45 },
    { label: 'GLM-4.5X', value: ZhipuAIModel.GLM45X },
    { label: 'GLM-4.5 Air', value: ZhipuAIModel.GLM45AIR },
    { label: 'GLM-4.5 AirX', value: ZhipuAIModel.GLM45AIRX },
    { label: 'GLM-4.5 Flash', value: ZhipuAIModel.GLM45FLASH },
  ]
  // 召回方式
  const retrieverTypeOptions = [
    { label: '语义搜索', value: RetrieverType.SEMANTIC },
    { label: '混合检索', value: RetrieverType.HYBRID },
  ]
  // 召回类别
  const retrieverCategoryOptions = [
    { label: '摘要', value: RetrieverCategory.SUMMARY },
    { label: '词条', value: RetrieverCategory.TERM },
  ]
  // 检索方式
  const searchModeOptions = [
    { label: '强制检索', value: SearchMode.FORCE },
    { label: 'Agent检索', value: SearchMode.AGENT },
  ]

  const form = reactive<SessionForm>({
    id: '',
    title: '',
    config: {
      sysPrompt: '',
      instructionPrompt: '',
      summaryPrompt: '',
      queryExtractPrompt: '',
      model: ZhipuAIModel.GLM45FLASH,
      apiKey: '',
      baseUrl: '',
      temperature: 0.9,
      maxTokens: 65536,
      topK: 5,
      history: 10,
      retrieverType: RetrieverType.SEMANTIC,
      retrieverCategory: [RetrieverCategory.SUMMARY],
      enableRetriever: true,
      enableSummary: true,
      searchMode: SearchMode.FORCE,
      summaryTurn: 5,
    },
  })

  return {
    curSession,
    modelOptions,
    retrieverTypeOptions,
    retrieverCategoryOptions,
    searchModeOptions,
    activeNames,
    form,
  }
}
