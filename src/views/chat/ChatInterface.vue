<template>
  <div class="chat-interface">
    <!-- 左侧会话列表 -->
    <ChatSession style="width: 250px" />

    <!-- 右侧聊天主界面 -->
    <div class="chat-main">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="chat-title">
          <h2>{{ curSession?.title || '选择会话开始聊天' }}</h2>
        </div>

        <div class="chat-actions">
          <div v-if="summaryLoading" class="memory-loading">
            <el-icon class="is-loading"><Loading /></el-icon>
            <el-text>记忆中...</el-text>
            <el-divider direction="vertical" />
          </div>

          <el-text>回合：{{ curSession?.turn }}</el-text>

          <el-divider direction="vertical" />

          <el-button type="text" :disabled="!curSession" @click="openSessionConfig = true">
            <el-icon><Setting /></el-icon>
            设置
          </el-button>

          <el-button type="text" :disabled="!curSession" @click="openMemoMgt = true">
            <el-icon><Memo /></el-icon>
            记忆
          </el-button>

          <el-button type="text" @click="handleImport">
            <el-icon><Upload /></el-icon>
            导入
          </el-button>

          <el-button type="text" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </div>
      </div>

      <ChatMsg />

      <ChatInput />
    </div>

    <SessionConfig v-model="openSessionConfig" />

    <MemoMgt v-model="openMemoMgt" :tenantName="curSession?.id" />

    <ImportDb v-model="openImport" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload, Download, Setting, Memo, Loading } from '@element-plus/icons-vue'
import { getCurSession, getSummaryLoading } from './service/workspace'
import { exportDB } from '@/db'
import ChatMsg from './ChatMsg.vue'
import ChatSession from './ChatSession.vue'
import ChatInput from './ChatInput.vue'
import SessionConfig from './components/SessionConfig/SessionConfig.vue'
import MemoMgt from './components/MemoMgt/MenoMgt.vue'
import ImportDb from './components/ImportDb.vue'

const curSession = getCurSession()
const summaryLoading = getSummaryLoading()
const openSessionConfig = ref(false)
const openMemoMgt = ref(false)
const openImport = ref(false)

async function handleExport() {
  await exportDB()
}

function handleImport() {
  openImport.value = true
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
  height: 100%;
  width: calc(100% - 250px);
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.chat-header {
  padding: 12px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .chat-title {
    display: flex;
    align-items: center;
    gap: 5px;

    h2 {
      margin: 0;
      color: #303133;
      font-size: 18px;
      font-weight: 600;
    }
  }
}

.chat-actions {
  display: flex;
  align-items: center;
  /* gap: 10px; */

  .memory-loading {
    display: flex;
    align-items: center;
    gap: 2px;
  }
}
</style>
