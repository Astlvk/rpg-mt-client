<template>
  <div class="chat-session">
    <div class="sidebar-header">
      <h2>RPG-MT</h2>
      <el-button type="primary" :icon="Plus" size="small" @click="handleCreateSession" />
    </div>

    <div class="chat-list">
      <div
        v-for="chat in [...(sessions || [])].reverse()"
        :key="chat.id"
        class="chat-item"
        :class="{ active: curSession?.id === chat.id }"
        @click="handleSelectSession(chat)"
      >
        <div class="chat-avatar">
          <el-avatar :size="40" :src="chat.avatar">
            <el-icon><ChatDotRound /></el-icon>
          </el-avatar>
        </div>

        <div class="chat-info">
          <div class="chat-title">{{ chat.title }}</div>
          <div class="chat-preview">{{ chat.lastMsg }}</div>
          <div class="chat-time">
            {{ dayjs(chat.lastMsgTime || chat.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
          </div>
        </div>
        <el-button type="danger" link :icon="Delete" @click.stop="handleDel(chat.id)" />
      </div>

      <el-empty description="暂无会话" v-if="sessions?.length === 0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import dayjs from 'dayjs'
import { Plus, ChatDotRound, Delete } from '@element-plus/icons-vue'
import { useSession } from './service/useSession'

onMounted(() => {
  init()
})

const { sessions, curSession, init, handleSelectSession, handleCreateSession, handleDel } =
  useSession()
</script>

<style lang="postcss" scoped>
.chat-session {
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    color: #303133;
    font-size: 16px;
    font-weight: 600;
  }
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f7fa;
  }

  &.active {
    background-color: #ecf5ff;
    border-right: 3px solid #409eff;
  }
}

.chat-avatar {
  margin-right: 12px;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-preview {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-time {
  font-size: 11px;
  color: #c0c4cc;
}

/* 滚动条样式 */
.chat-list::-webkit-scrollbar {
  width: 6px;
}

.chat-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
