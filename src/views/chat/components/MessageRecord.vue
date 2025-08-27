<template>
  <el-drawer
    v-model="open"
    title="对话记录"
    size="50%"
    direction="rtl"
    append-to-body
    destroy-on-close
    :z-index="1001"
    @open="handleOpen"
    @close="handleClose"
  >
    <div class="message-record">
      <div class="action-bar">
        <el-text type="info" size="small"> 总数：{{ total }} </el-text>
        <el-text type="info" size="small"> 总页数：{{ totalPage }} </el-text>
        <!-- <el-text type="info" size="small"> 当前页：{{ cursorStack.length + 1 }} </el-text> -->

        <div>
          <el-button type="primary" link @click="handlePrevPage"> 上一页 </el-button>
          <el-button type="primary" link @click="handleNextPage">下一页</el-button>
        </div>

        <el-select v-model="pageSize" size="small" style="width: 90px" @change="init">
          <el-option label="10" :value="10" />
          <el-option label="20" :value="20" />
          <el-option label="30" :value="30" />
          <el-option label="40" :value="40" />
        </el-select>
      </div>

      <div class="list-con">
        <div v-for="item in list" :key="item.id" class="list-item">
          <div class="header">
            <div class="role">
              <el-tag
                :type="item.role === Role.AI ? 'primary' : 'info'"
                effect="dark"
                style="width: 60px"
              >
                {{ item.role === Role.AI ? 'AI' : item.role === Role.USER ? 'USER' : 'SYSTEM' }}
              </el-tag>
            </div>

            <div class="createdAt">
              <el-text type="info">
                {{ dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
              </el-text>
            </div>
          </div>

          <div class="content">
            <MdPreview :modelValue="item.content" :codeFoldable="false" />
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Message } from '@/schema/chat'
import { Role } from '@/schema/enum'
import dayjs from 'dayjs'
import { getMessageCount, getMessagesByLimit, prevPage, nextPage } from '@/db/useMessagesRepo'
import { MdPreview } from 'md-editor-v3'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  sessionId: {
    type: String,
    default: '',
  },
})
const emit = defineEmits(['update:modelValue', 'done', 'close'])
const open = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})
const cursors: { oldest?: number; newest?: number } = {}
const pageSize = ref(10)
const total = ref(0)
const totalPage = computed(() => {
  return Math.ceil(total.value / pageSize.value)
})
const list = ref<Message[]>([])

async function init() {
  total.value = await getMessageCount(props.sessionId)
  const res = await getMessagesByLimit(props.sessionId, pageSize.value)
  list.value = res
  updateCursorsFromPage(res)
}

async function handlePrevPage() {
  if (!cursors.oldest) return
  const res = await prevPage(props.sessionId, cursors.oldest, pageSize.value) // 更旧（升序）
  if (res.length === 0) return
  list.value = res
  updateCursorsFromPage(res)
}

async function handleNextPage() {
  if (!cursors.newest) return
  const res = await nextPage(props.sessionId, cursors.newest, pageSize.value) // 更新（升序）
  if (res.length === 0) return
  list.value = res
  updateCursorsFromPage(res)
}

function updateCursorsFromPage(rows: Message[]) {
  if (rows.length > 0) {
    cursors.oldest = rows[0].createdAt
    cursors.newest = rows[rows.length - 1].createdAt
  } else {
    cursors.oldest = undefined
    cursors.newest = undefined
  }
}

function handleOpen() {
  console.log('handleOpen')
  init()
}

function handleClose() {
  console.log('handleClose')
}
</script>

<style lang="postcss" scoped>
.message-record {
  height: 100%;

  .list-con {
    height: calc(100% - 22px);
    overflow-y: auto;

    .list-item {
      padding: 20px;
      /* border-bottom: 1px solid #e5e5e5; */
      /* background-color: #f5f7fa; */

      .header {
        margin-bottom: 10px;
        padding-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #e5e5e5;
      }

      .content {
        max-height: 200px;
        overflow-y: auto;
      }
    }
  }

  .action-bar {
    height: 22px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 20px;
  }
}
</style>
