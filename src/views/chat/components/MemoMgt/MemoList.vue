<template>
  <div class="memo-list">
    <div class="action-bar">
      <el-text type="info" size="small"> 仅浏览用，非顺序排序（UUID升序）； </el-text>
      <!-- 总页数 -->
      <el-text type="info" size="small"> 总数：{{ total }} </el-text>
      <el-text type="info" size="small"> 总页数：{{ totalPage }} </el-text>
      <el-text type="info" size="small"> 当前页：{{ cursorStack.length + 1 }} </el-text>

      <div>
        <el-button type="primary" link @click="handleAddMemo">新增</el-button>
        <el-button type="primary" link :disabled="cursorStack.length === 0" @click="handlePrevPage">
          上一页
        </el-button>
        <el-button type="primary" link @click="handleNextPage">下一页</el-button>
      </div>

      <el-select v-model="pageSize" size="small" style="width: 90px" @change="handlePageSizeChange">
        <el-option label="10" :value="10" />
        <el-option label="20" :value="20" />
        <el-option label="30" :value="30" />
        <el-option label="40" :value="40" />
      </el-select>
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
import { ref, computed, onMounted } from 'vue'
import { getSummarysByCursor } from '@/api/base.api'
import type { SummaryItem } from '@/schema/summary'
import { ElMessage, ElLoading } from 'element-plus'
import ResList from './ResList.vue'

const props = defineProps({
  tenantName: {
    type: String,
    default: null,
  },
})

onMounted(() => {
  getSummaryList()
})

const openAddMemo = ref(false)
const pageSize = ref(10)
const cursorStack = ref<string[]>([])
const total = ref(0)
const totalPage = computed(() => {
  return Math.ceil(total.value / pageSize.value)
})
const summaryList = ref<SummaryItem[]>([])

async function getSummaryList() {
  const loading = ElLoading.service({
    text: '加载中...',
  })
  if (props.tenantName) {
    try {
      const { total: t, data } = await getSummarysByCursor(
        props.tenantName,
        cursorStack.value[cursorStack.value.length - 1],
        pageSize.value,
      )
      total.value = t
      if (data.length) {
        summaryList.value = data
      } else {
        cursorStack.value.pop()
        ElMessage.warning('没有更多数据了')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('加载失败，详情请查看控制台输出')
    }
  }
  loading.close()
}

function handleNextPage() {
  const cursor = summaryList.value[summaryList.value.length - 1].uuid
  cursorStack.value.push(cursor)
  getSummaryList()
}

function handlePrevPage() {
  cursorStack.value.pop()
  getSummaryList()
}

function handlePageSizeChange() {
  cursorStack.value = []
  getSummaryList()
}

function handleAddMemo() {
  openAddMemo.value = true
}
</script>

<style lang="postcss" scoped>
.memo-list {
  height: 100%;
  width: 100%;

  .action-bar {
    height: 22px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 20px;
  }

  .list-con {
    height: calc(100% - 22px);
    display: flex;
    flex-wrap: wrap;
    overflow-y: auto;

    .item {
      padding: 5px;
      box-sizing: border-box;
      width: 25%;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  .summary-con {
    height: 500px;
    overflow-y: auto;
  }
}
</style>
