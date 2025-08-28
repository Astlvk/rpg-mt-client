<template>
  <div class="res-list">
    <template v-for="item in summaryList" :key="item.uuid">
      <div class="item">
        <el-card class="card" shadow="hover" style="height: 320px">
          <template #header>
            <div class="card-header">
              <div>
                <el-text type="info" size="small" style="margin-right: 10px">
                  更新时间：{{ item.updated_at }}
                </el-text>
                <el-text type="info" size="small">turn：{{ item.turn }}</el-text>
              </div>

              <div>
                <el-button type="primary" link @click="handleView(item)">查看</el-button>
                <el-popconfirm
                  title="确定删除该消息吗？"
                  placement="left-start"
                  width="200"
                  cancel-button-text="取消"
                  confirm-button-text="确定"
                  @confirm="handleDel(item.uuid)"
                >
                  <template #reference>
                    <el-button type="danger" link>删除</el-button>
                  </template>
                </el-popconfirm>
              </div>
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
        <MdEditor v-model="curSummary" :codeFoldable="false" :preview="false" />
      </div>

      <template #footer>
        <el-button type="primary" :loading="btnLoading" @click="handleUpdate">更新</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'
import { deleteSummary, updateSummary } from '@/api/base.api'
import type { SummaryItem } from '@/schema/summary'
import { MdEditor } from 'md-editor-v3'
import { ElMessage, ElLoading } from 'element-plus'

const props = defineProps({
  summaryList: {
    type: Array as PropType<SummaryItem[]>,
    default: () => [],
  },
  tenantName: {
    type: String,
    default: null,
  },
})
const emit = defineEmits(['success'])

const open = ref(false)
const btnLoading = ref(false)
const curSummaryItem = ref<SummaryItem | null>(null)
const curSummary = ref('')

function handleView(val: SummaryItem) {
  curSummaryItem.value = val
  curSummary.value = val.summary
  open.value = true
}

async function handleUpdate() {
  btnLoading.value = true
  if (!curSummaryItem.value) return
  try {
    await updateSummary(
      props.tenantName,
      curSummaryItem.value.uuid,
      curSummary.value,
      curSummaryItem.value.turn,
    )
    open.value = false
    curSummaryItem.value = null
    curSummary.value = ''
    emit('success')
    ElMessage.success('更新成功')
  } catch (error) {
    console.error(error)
    ElMessage.error('更新失败')
  }
  btnLoading.value = false
}

async function handleDel(uuid: string) {
  const loading = ElLoading.service({ text: '删除中...' })
  try {
    await deleteSummary(props.tenantName, uuid)
    ElMessage.success('删除成功')
    emit('success')
  } catch (error) {
    console.error(error)
    ElMessage.error('删除失败')
  }
  loading.close()
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
