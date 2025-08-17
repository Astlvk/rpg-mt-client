<template>
  <div class="chat-interface">
    <!-- 左侧会话列表 -->
    <ChatLeft />

    <!-- 右侧聊天主界面 -->
    <div class="chat-main">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="chat-title">
          <h2>{{ currentChat?.title || '选择会话开始聊天' }}</h2>
        </div>

        <div class="chat-actions">
          <el-button type="text">
            <el-icon><Delete /></el-icon>
            清空聊天
          </el-button>
          <el-button type="text">
            <el-icon><Download /></el-icon>
            导出聊天
          </el-button>
        </div>
      </div>

      <div class="chat-messages" ref="messagesContainer">
        <!-- <ChatMsg
          v-for="message in currentMessages"
          :key="message.id"
          :message="message"
          :user-avatar="userAvatar"
          :bot-avatar="botAvatar"
        /> -->
      </div>

      <ChatInput />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete, Download } from '@element-plus/icons-vue'
import ChatMsg from './ChatMsg.vue'
import ChatLeft from './ChatLeft.vue'
import ChatInput from './ChatInput.vue'

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}
</script>

<style lang="postcss" scoped>
.chat-interface {
  height: 100vh;
  display: flex;
  background-color: #f5f5f5;
}

/* 右侧聊天主界面 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    color: #303133;
    font-size: 18px;
    font-weight: 600;
  }
}

.chat-actions {
  display: flex;
  gap: 10px;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #fafafa;
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
