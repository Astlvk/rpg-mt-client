<template>
  <div class="res-list">
    <template v-for="item in summaryList" :key="item.uuid">
      <div class="item">
        <el-card class="card" shadow="hover" style="height: 320px">
          <template #header>
            <div class="card-header">
              <el-text type="info" size="small">更新时间：{{ item.updated_at }}</el-text>
              <el-button type="primary" link @click="handleView(item.summary)">查看</el-button>
            </div>
          </template>

          <el-text line-clamp="8">{{ item.summary }}</el-text>

          <template #footer>
            <div class="card-footer">
              <el-text type="info" size="small">distance：{{ item.distance }}</el-text>
              <el-text type="info" size="small">score：{{ item.score }}</el-text>
            </div>
          </template>
        </el-card>
      </div>
    </template>

    <el-empty v-if="summaryList.length === 0" description="暂无数据" style="width: 100%" />

    <el-dialog v-model="open" title="摘要详情" width="50%">
      <div class="summary-con">
        <MdPreview :modelValue="summary" :codeFoldable="false" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'
import type { SummaryItem } from '@/schema/summary'
import { MdPreview } from 'md-editor-v3'

defineProps({
  summaryList: {
    type: Array as PropType<SummaryItem[]>,
    default: () => [],
  },
})
const open = ref(false)
const summary = ref('')

const handleView = (val: string) => {
  summary.value = val
  open.value = true
}
</script>

<style lang="postcss" scoped>
.res-list {
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  overflow-y: auto;

  .item {
    padding: 5px;
    box-sizing: border-box;
    width: 25%;

    .card {
      height: 320px;
      display: flex;
      flex-direction: column;

      :deep(.el-card__body) {
        flex: 1;
        overflow-y: auto;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .card-footer {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
      }
    }
  }

  .summary-con {
    height: 500px;
    overflow-y: auto;
  }
}
</style>
