<template>
  <div class="chat-interface">
    <!-- 移动端展开会话按钮，仅移动端显示 -->
    <el-button
      class="mobile-session-toggle"
      type="primary"
      circle
      @click="showSession = true"
      v-show="!isPC && !showSession"
    >
      <el-icon><Menu /></el-icon>
    </el-button>

    <!-- 左侧会话列表，PC端常显，移动端根据showSession控制 -->
    <div>
      <ChatSession
        class="chat-session"
        v-show="isPC || showSession"
        :class="{ 'mobile-session': !isPC, 'mobile-session-show': showSession && !isPC }"
      />
      <!-- 遮罩层，移动端展开时显示 -->
      <div
        v-if="showSession && !isPC"
        class="mobile-session-mask"
        @click="showSession = false"
      ></div>
      <!-- 移动端关闭按钮 -->
      <!-- <el-button
        v-if="showSession && !isPC"
        class="mobile-session-close"
        type="danger"
        circle
        size="small"
        @click="showSession = false"
      >
        <el-icon><Close /></el-icon>
      </el-button> -->
    </div>

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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Upload, Download, Setting, Memo, Loading, Menu } from '@element-plus/icons-vue'
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

// 控制会话列表展开/收起，仅移动端需要
const showSession = ref(false)
// 判断是否PC端
const isPC = ref(true)

function checkIsPC() {
  isPC.value = window.innerWidth > 600
  // 仅移动端切换时自动收起会话
  if (!isPC.value) showSession.value = false
}

onMounted(() => {
  checkIsPC()
  window.addEventListener('resize', checkIsPC)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsPC)
})

async function handleExport() {
  await exportDB()
}

function handleImport() {
  openImport.value = true
}
</script>

<style lang="postcss" scoped>
.chat-session {
  width: 250px;
  height: 100vh;
  overflow-y: auto;
}

.chat-interface {
  position: relative;
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
  transition: none;
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

  .memory-loading {
    display: flex;
    align-items: center;
    gap: 2px;
  }
}

@media (max-width: 600px) {
  .chat-interface {
    flex-direction: column;

    .chat-header {
      justify-content: flex-end;
    }

    .chat-title {
      display: none;
    }
  }

  .chat-session {
    display: none;
  }

  .chat-main {
    width: 100%;
  }

  .mobile-session-toggle {
    position: fixed;
    left: 12px;
    top: 12px;
    z-index: 1001;
    display: inline-flex;
  }

  .mobile-session {
    position: fixed;
    display: block !important;
    left: 0;
    top: 0;
    width: 80vw;
    max-width: 320px;
    height: 100vh;
    background: #fff;
    z-index: 1102;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s;
    transform: translateX(-100%);
  }

  .mobile-session-show {
    transform: translateX(0);
    display: block !important;
  }

  .mobile-session-mask {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.25);
    z-index: 1100;
  }

  .mobile-session-close {
    position: fixed;
    left: 0px;
    top: 0px;
    z-index: 1103;
    display: inline-flex;
  }
}
</style>
