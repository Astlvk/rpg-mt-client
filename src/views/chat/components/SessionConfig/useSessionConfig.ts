import type { ModelConfigType, SessionForm } from '@/schema/chat'
import { ref, reactive, toRaw } from 'vue'
import {
  ZhipuAIModel,
  DeepSeekModel,
  RetrieverMode,
  RetrieverCategory,
  SearchMode,
} from '@/schema/enum'
import { getCurSession, refreshCurSession } from '../../service/workspace'
import { updateSession } from '@/db/useSessionsRepo'
import { updateMessage } from '@/db/useMessagesRepo'
import { ElMessage, type FormInstance } from 'element-plus'

export function useSessionConfig() {
  const curSession = getCurSession()
  const formRef = ref<FormInstance>()

  const activeNames = ref([
    'base',
    // 'model', 'prompt', 'summary', 'retriever'
  ])
  const activeNameTab = ref<ModelConfigType>('writerModel')

  const modelOptions = [
    {
      label: 'qwen',
      options: [{ label: 'q4_k_m.gguf', value: 'q4_k_m.gguf' }],
    },
    {
      label: 'deepseek',
      options: [
        { label: 'DeepSeek-Chat', value: DeepSeekModel.DEEPSEEK_CHAT },
        { label: 'DeepSeek-Reasoner', value: DeepSeekModel.DEEPSEEK_REASONER },
      ],
    },
    {
      label: 'glm',
      options: [
        { label: 'GLM-4.5V', value: ZhipuAIModel.GLM45V },
        { label: 'GLM-4.5', value: ZhipuAIModel.GLM45 },
        { label: 'GLM-4.5X', value: ZhipuAIModel.GLM45X },
        { label: 'GLM-4.5 Air', value: ZhipuAIModel.GLM45AIR },
        { label: 'GLM-4.5 AirX', value: ZhipuAIModel.GLM45AIRX },
        { label: 'GLM-4.5 Flash', value: ZhipuAIModel.GLM45FLASH },
      ],
    },
  ]
  // 召回方式
  const retrieverModeOptions = [
    { label: '语义搜索', value: RetrieverMode.SIMILARITY },
    { label: '混合检索', value: RetrieverMode.HYBRID },
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
  // 模型配置
  const modelConfigTypes: ModelConfigType[] = ['writerModel', 'summaryModel', 'retrieverModel']
  const form = reactive<SessionForm>({
    title: '',
    turn: 0,
    config: {
      apiKey: '',
      baseUrl: '',
      sysPrompt: '',
      instructionPrompt: '',
      summaryPrompt: '',
      queryExtractPrompt: '',
      queryToolPrompt: '',
      firstAiMsg: '',
      writerModel: {
        model: '',
        temperature: 0.9,
        maxTokens: 65536,
      },
      summaryModel: {
        model: '',
        temperature: 0.5,
        maxTokens: 65536,
      },
      retrieverModel: {
        model: '',
        temperature: 0.5,
        maxTokens: 65536,
      },
      topK: 5,
      windowMsgNum: 50,
      history: 10,
      retrieverMode: RetrieverMode.SIMILARITY,
      retrieverCategory: [RetrieverCategory.SUMMARY],
      enableRetriever: true,
      enableSummary: true,
      updateSummary: false,
      searchMode: SearchMode.FORCE,
      summaryTurn: 5,
      distance: 0.5,
      summaryNum: 10,
    },
  })
  const rules = ref({
    title: [{ required: true, message: '请输入会话名称', trigger: 'blur' }],
    // 'config.writerModel.apiKey': [{ required: true, message: '请输入API Key', trigger: 'blur' }],
    // 'config.writerModel.baseUrl': [{ required: true, message: '请输入Base URL', trigger: 'blur' }],
    // 'config.retrieverModel.apiKey': [{ required: true, message: '请输入API Key', trigger: 'blur' }],
    // 'config.retrieverModel.baseUrl': [
    //   { required: true, message: '请输入Base URL', trigger: 'blur' },
    // ],
    // 'config.summaryModel.apiKey': [{ required: true, message: '请输入API Key', trigger: 'blur' }],
    // 'config.summaryModel.baseUrl': [{ required: true, message: '请输入Base URL', trigger: 'blur' }],
  })

  function init() {
    if (curSession.value) {
      form.title = curSession.value.title
      form.turn = curSession.value.turn
      // 赋值的时候解除引用关系，避免formRef.value?.resetFields()时，curSession.value.config受影响
      if (curSession.value.config) {
        form.config = { ...curSession.value.config }
        form.config.writerModel = { ...curSession.value.config.writerModel }
        form.config.summaryModel = { ...curSession.value.config.summaryModel }
        form.config.retrieverModel = { ...curSession.value.config.retrieverModel }
        form.config.retrieverCategory = [...curSession.value.config.retrieverCategory]
      }
    }
  }

  async function save() {
    if (curSession.value) {
      try {
        await formRef.value?.validate()
        try {
          // 获取下原始对象，不然响应式对象无法入库（报错无法clone）
          const rawForm = toRaw(form)
          rawForm.config.writerModel = toRaw(rawForm.config.writerModel)
          rawForm.config.retrieverModel = toRaw(rawForm.config.retrieverModel)
          rawForm.config.summaryModel = toRaw(rawForm.config.summaryModel)
          // 持久化会话配置
          await updateSession(curSession.value.id, {
            title: rawForm.title,
            turn: rawForm.turn,
            // 笑死，这里直接传rawForm.config也会导致form.config === curSession.value.config
            // 不好说是dexie官方推荐的vue响应式数据会复用对象还是dexie会复用对象
            config: structuredClone(rawForm.config),
            updatedAt: Date.now(),
          })
          // 构建开场白数据
          await buildFirstAiMsg()
          ElMessage.success('保存成功')
          await refreshCurSession(curSession.value.id)
        } catch (error) {
          console.error(error)
          ElMessage.error((error as Error).message)
        }
      } catch (error) {
        console.error(error)
        ElMessage.error('请检查表单是否填写正确')
      }
    }
  }

  async function buildFirstAiMsg() {
    // TODO: 构建开场白数据
    const firstAiMsgId = 'firstAiMsg-' + curSession.value!.id
    await updateMessage(firstAiMsgId, {
      content: form.config.firstAiMsg,
      updatedAt: Date.now(),
    })
  }

  async function generateFirstAiMsg() {
    // TODO: llm生成开场白
  }

  return {
    curSession,
    modelOptions,
    retrieverModeOptions,
    retrieverCategoryOptions,
    searchModeOptions,
    modelConfigTypes,
    activeNames,
    activeNameTab,
    formRef,
    form,
    rules,
    init,
    save,
    generateFirstAiMsg,
  }
}
