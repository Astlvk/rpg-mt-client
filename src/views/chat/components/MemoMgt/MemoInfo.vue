<template>
  <div class="memo-info">
    <template v-for="queryInfo in docs" :key="queryInfo.query">
      <h3>
        检索词：<el-text type="primary">{{ queryInfo.query }}</el-text>
      </h3>

      <div class="query-info">
        <div class="item" v-for="(item, index) in queryInfo.summaries" :key="index">
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
      </div>
    </template>

    <el-dialog v-model="openDetail" title="摘要详情" width="50%">
      <div class="summary-con">
        <MdPreview :modelValue="summary" :codeFoldable="false" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { queryInfo } from '@/schema/summary'
import { ref, type PropType } from 'vue'
import { MdPreview } from 'md-editor-v3'

defineProps({
  docs: {
    type: Array as PropType<queryInfo[]>,
    default: () => [],
  },
})

const openDetail = ref(false)
const summary = ref('')

function handleView(val: string) {
  openDetail.value = true
  summary.value = val
}
</script>

<style lang="postcss" scoped>
.memo-info {
  height: 100%;
  overflow-y: auto;

  h3 {
    padding: 10px 0;
  }

  .query-info {
    display: flex;
    display: flex;
    flex-wrap: wrap;

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
  }

  .summary-con {
    height: 500px;
    overflow-y: auto;
  }
}
</style>
