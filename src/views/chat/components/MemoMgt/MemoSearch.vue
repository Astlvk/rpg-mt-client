<template>
  <div class="memo-search">
    <div class="search-bar">
      <el-text type="info">{{ summaryList.length }}条</el-text>
      <el-input
        v-model="search"
        placeholder="搜索内容"
        style="width: 300px"
        @keyup.enter="handleSearch"
      />

      <el-text type="info">搜索类型</el-text>
      <el-select v-model="searchType" placeholder="请选择搜索类型" style="width: 100px">
        <el-option label="关键字" value="keyword" />
        <el-option label="相似性" value="similarity" />
        <el-option label="混合" value="hybrid" />
      </el-select>

      <el-text type="info">相似性距离</el-text>
      <el-input-number
        v-if="searchType !== 'keyword'"
        v-model="distance"
        placeholder="相似性距离"
        :min="0"
        :max="1"
        :step="0.1"
        @keyup.enter="handleSearch"
      />

      <el-text type="info">返回数量</el-text>
      <el-input-number
        v-model="topk"
        placeholder="返回数量"
        :min="1"
        :step="1"
        @keyup.enter="handleSearch"
      />

      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <ResList
      :tenantName="tenantName"
      :summaryList="summaryList"
      style="height: calc(100% - 22px)"
      @success="getSummaryList"
    />
  </div>
</template>

<script setup lang="ts">
import type { SummaryItem } from '@/schema/summary'
import { ref } from 'vue'
import { searchSummary } from '@/api/base.api'
import { ElLoading, ElMessage } from 'element-plus'
import ResList from './ResList.vue'

const props = defineProps({
  tenantName: {
    type: String,
    default: null,
  },
})

const search = ref('')
const searchType = ref('keyword')
const summaryList = ref<SummaryItem[]>([])
const distance = ref(0.5)
const topk = ref(10)

async function getSummaryList() {
  const loading = ElLoading.service({
    text: '搜索中...',
  })
  try {
    const res = await searchSummary(
      props.tenantName,
      search.value,
      searchType.value,
      distance.value,
      topk.value,
    )
    summaryList.value = res.data
  } catch (error) {
    console.error(error)
    ElMessage.error('搜索失败，详情请查看控制台输出')
  }
  loading.close()
}

function handleSearch() {
  getSummaryList()
}
</script>

<style lang="postcss" scoped>
.memo-search {
  width: 100%;
  height: 100%;

  .search-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
  }
}
</style>
