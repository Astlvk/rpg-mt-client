<template>
  <div class="chat-interface">
    <!-- 左侧会话列表 -->
    <ChatSession />

    <!-- 右侧聊天主界面 -->
    <div class="chat-main">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="chat-title">
          <h2>{{ curSession?.title || '选择会话开始聊天' }}</h2>
        </div>

        <div class="chat-actions">
          <el-button type="text" @click="openSessionConfig = true">
            <el-icon><Setting /></el-icon>
            设置
          </el-button>
          <el-button type="text" disabled>
            <el-icon><Delete /></el-icon>
            清空聊天
          </el-button>
          <el-button type="text" disabled>
            <el-icon><Download /></el-icon>
            导出聊天
          </el-button>
        </div>
      </div>

      <ChatMsg />

      <ChatInput />
    </div>

    <SessionConfig v-model="openSessionConfig" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Delete, Download, Setting } from '@element-plus/icons-vue'
import { getCurSession } from './service/workspace'
import ChatMsg from './ChatMsg.vue'
import ChatSession from './ChatSession.vue'
import ChatInput from './ChatInput.vue'
import SessionConfig from './components/SessionConfig/SessionConfig.vue'

const curSession = getCurSession()
const openSessionConfig = ref(false)
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
</style>
