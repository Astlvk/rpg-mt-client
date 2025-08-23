<template>
  <div class="memo-search">
    <div class="search-bar">
      <el-input
        v-model="search"
        placeholder="搜索内容"
        style="width: 300px"
        @keyup.enter="handleSearch"
      />

      <el-select v-model="searchType" placeholder="请选择搜索类型" style="width: 100px">
        <el-option label="关键字" value="keyword" />
        <el-option label="相似性" value="similarity" />
        <el-option label="混合" value="hybrid" />
      </el-select>

      <el-input-number
        v-if="searchType !== 'keyword'"
        v-model="distance"
        placeholder="相似性距离"
        :min="0"
        :max="1"
        :step="0.1"
      />
      <el-input-number v-model="topk" placeholder="返回数量" :min="1" :step="1" />

      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <ResList :summaryList="summaryList" style="height: calc(100% - 22px)" />
  </div>
</template>

<script setup lang="ts">
import type { SummaryItem } from '@/schema/summary'
import { ref } from 'vue'
import { searchSummary } from '@/api/base.api'
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
  const res = await searchSummary(
    props.tenantName,
    search.value,
    searchType.value,
    distance.value,
    topk.value,
  )
  summaryList.value = res.data
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
