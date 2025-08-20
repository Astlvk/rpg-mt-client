import type { SessionForm } from '@/schema/chat'
import { ref, reactive, toRaw } from 'vue'
import { ZhipuAIModel, RetrieverType, RetrieverCategory, SearchMode } from '@/schema/enum'
import { getCurSession, refreshCurSession } from '../../service/workspace'
import { updateSession } from '@/db/useSessionsRepo'
import { ElMessage, type FormInstance } from 'element-plus'

export function useSessionConfig() {
  const curSession = getCurSession()
  const formRef = ref<FormInstance>()

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
      distance: 0.5,
    },
  })
  const rules = ref({
    title: [{ required: true, message: '请输入会话名称', trigger: 'blur' }],
    'config.apiKey': [{ required: true, message: '请输入API Key', trigger: 'blur' }],
    'config.baseUrl': [{ required: true, message: '请输入Base URL', trigger: 'blur' }],
  })

  function init() {
    if (curSession.value) {
      form.title = curSession.value.title
      // 赋值的时候解除引用关系，避免formRef.value?.resetFields()时，curSession.value.config受影响
      if (curSession.value.config) {
        form.config = { ...curSession.value.config }
        form.config.retrieverCategory = [...curSession.value.config.retrieverCategory]
      }
    }
  }

  async function save() {
    if (curSession.value) {
      try {
        await formRef.value?.validate()
        // 获取下原始对象，不然响应式对象无法入库（报错无法clone）
        const rawForm = toRaw(form)
        await updateSession(curSession.value.id, {
          title: rawForm.title,
          // 笑死，这里直接传rawForm.config也会导致form.config === curSession.value.config
          // 不好说是dexie官方推荐的vue响应式数据会复用对象还是dexie会复用对象
          config: structuredClone(rawForm.config),
          updatedAt: Date.now(),
        })
        ElMessage.success('保存成功')
        await refreshCurSession(curSession.value.id)
      } catch (error) {
        console.error(error)
        ElMessage.error((error as Error).message)
      }
    }
  }

  return {
    curSession,
    modelOptions,
    retrieverTypeOptions,
    retrieverCategoryOptions,
    searchModeOptions,
    activeNames,
    formRef,
    form,
    rules,
    save,
    init,
  }
}
