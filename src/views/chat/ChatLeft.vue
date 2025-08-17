<template>
  <div class="chat-left">
    <div class="sidebar-header">
      <h2>RPG-MT</h2>
      <el-button type="primary" :icon="Plus" @click="createNewChat"> 新的世界 </el-button>
    </div>

    <div class="chat-list">
      <div
        v-for="chat in sessions"
        :key="chat.id"
        class="chat-item"
        :class="{ active: currentChatId === chat.id }"
        @click="selectChat(chat.id)"
      >
        <div class="chat-avatar">
          <el-avatar :size="40" :src="chat.avatar">
            <el-icon><ChatDotRound /></el-icon>
          </el-avatar>
        </div>

        <div class="chat-info">
          <div class="chat-title">{{ chat.title }}</div>
          <div class="chat-preview">{{ chat.lastMessage }}</div>
          <div class="chat-time">{{ chat.lastTime }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Plus, ChatDotRound } from '@element-plus/icons-vue'
import { useSessionsRepo } from '@/db/useSessionsRepo'
import { getUUID } from '@/utils'
import { setCurChatSession } from './service/workspace'

const emit = defineEmits(['select-chat', 'create-chat'])

onMounted(() => {
  init()
})

const { sessions, addSession, getSessions } = useSessionsRepo()

init()

async function init() {
  const sessionList = await getSessions()
  console.log('sessionList', sessionList)
  // 初始化，不存在则创建
  if (sessionList.length === 0) {
    const newSession = {
      id: getUUID(),
      title: '新的世界',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    addSession(newSession)
    setCurChatSession(newSession)
  } else {
    setCurChatSession(sessionList[0])
  }
}

function selectChat(chatId: string) {
  emit('select-chat', chatId)
}

function createNewChat() {
  emit('create-chat')
}
</script>

<style lang="postcss" scoped>
.chat-left {
  width: 300px;
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
