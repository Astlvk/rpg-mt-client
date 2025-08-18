<template>
  <div class="chat-left">
    <div class="sidebar-header">
      <h2>RPG-MT</h2>
      <el-button type="primary" :icon="Plus" @click="handleCreateSession"> 新的世界 </el-button>
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
          <div class="chat-time">{{ dayjs(chat.createdAt).format('YYYY-MM-DD HH:mm:ss') }}</div>
        </div>
        <el-button type="danger" :icon="Delete" size="small" @click.stop="handleDel(chat.id)" />
      </div>

      <el-empty description="暂无世界" v-if="sessions?.length === 0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Session } from '@/schema/chat'
import { onMounted } from 'vue'
import dayjs from 'dayjs'
import { getUUID } from '@/utils'
import { useSessionsRepo } from '@/db/useSessionsRepo'
import { setCurSession, getCurSession } from './service/workspace'
import { ElMessageBox } from 'element-plus'
import { Plus, ChatDotRound, Delete } from '@element-plus/icons-vue'

onMounted(() => {
  init()
})

const curSession = getCurSession()
const { sessions, getSessionCount, getSessionByIndex, addSession, deleteSession } =
  useSessionsRepo()

async function init() {
  const count = await getSessionCount()

  // 初始化，不存在则创建
  if (count === 0) {
    const newSession = buildNewSession()
    await addSession(newSession)
    setCurSession(newSession)
  }

  if (count > 0) {
    const session = await getSessionByIndex(count - 1)
    if (session) {
      setCurSession(session)
    }
  }
}

// 选择会话
function handleSelectSession(session: Session) {
  setCurSession(session)
}

// 创建会话
function handleCreateSession() {
  const newSession = buildNewSession()
  addSession(newSession)
}

// 删除会话
function handleDel(chatId: string) {
  ElMessageBox.confirm('确认删除该会话吗？', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
    customStyle: {
      position: 'relative',
      top: '-10%',
    },
  }).then(() => {
    deleteSession(chatId)
  })
}

// 构建新会话对象
function buildNewSession() {
  const newSession = {
    id: getUUID(),
    title: '新的世界',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  return newSession
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
