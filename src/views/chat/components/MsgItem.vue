<template>
  <div
    class="msg-item"
    :class="{ 'msg-user': msg.role === Role.USER, 'msg-bot': msg.role === Role.AI }"
  >
    <div class="msg-avatar">
      <el-avatar :size="36">
        <el-icon v-if="msg.role === Role.USER"><User /></el-icon>
        <el-icon v-else><Service /></el-icon>
      </el-avatar>
    </div>

    <div class="msg-content">
      <div class="msg-text">
        <MdPreview :modelValue="msg.content" :codeFoldable="false" />

        <div v-if="msg.loading" class="msg-loading">
          <el-icon class="is-loading" size="16">
            <Loading />
          </el-icon>
          <span>生成中...</span>
        </div>
      </div>
      <div class="msg-time">
        {{ dayjs(msg.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
        <el-button
          v-if="msg.docs && msg.docs.length > 0"
          type="primary"
          link
          size="small"
          :icon="Memo"
          @click="handleMemo(msg)"
        />
        <el-popconfirm
          v-if="!msg.id.includes(aiMsgIdPrefix)"
          title="确定删除该消息吗？"
          placement="left-start"
          width="200"
          cancel-button-text="取消"
          confirm-button-text="确定"
          @confirm="deleteMessageById(msg.id)"
        >
          <template #reference>
            <el-button type="danger" link size="small" :icon="Delete" style="margin-left: 0px" />
          </template>
        </el-popconfirm>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue'
import type { Message } from '@/schema/chat'
import { Role } from '@/schema/enum'
import dayjs from 'dayjs'
import { MdPreview } from 'md-editor-v3'
import { User, Service, Loading, Delete, Memo } from '@element-plus/icons-vue'

defineProps({
  msg: {
    type: Object as PropType<Message>,
    required: true,
  },
})
const emit = defineEmits(['memo', 'delete'])
const aiMsgIdPrefix = 'firstAiMsg-'

const handleMemo = (msg: Message) => {
  emit('memo', msg)
}

const deleteMessageById = (id: string) => {
  emit('delete', id)
}
</script>

<style lang="postcss" scoped>
.msg-item {
  display: flex;
  margin-bottom: 20px;

  &.msg-user {
    flex-direction: row-reverse;

    .msg-content {
      margin-left: 0;
      margin-right: 12px;
      align-items: flex-end;
    }

    .msg-text {
      background-color: #409eff;
      border-radius: 18px 18px 4px 18px;

      :deep(.md-editor) {
        --md-color: #fff;
      }
    }
  }

  &.msg-bot {
    .msg-text {
      background-color: #fff;
      color: #303133;
      border-radius: 18px 18px 18px 4px;
      border: 1px solid #e4e7ed;
    }
  }

  .msg-avatar {
    flex-shrink: 0;
  }

  .msg-content {
    margin-left: 12px;
    display: flex;
    flex-direction: column;
    max-width: 70%;

    :deep(.md-editor) {
      background-color: transparent;
    }
    :deep(.md-editor-code-head) {
      z-index: 1000;
    }
  }

  .msg-text {
    padding: 4px 16px;
    min-height: 20px;
  }

  .msg-time {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: #c0c4cc;
    margin-top: 4px;
  }

  .msg-loading {
    display: flex;
    align-items: center;
    gap: 4px;

    span {
      font-size: 13px;
      color: #909399;
    }
  }
}
</style>
