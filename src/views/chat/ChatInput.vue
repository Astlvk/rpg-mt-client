<template>
  <div class="chat-input">
    <div class="setting">
      <label class="">深度思考</label>
      <el-switch class="mr-[8px]" :active-value="false" :inactive-value="true" size="small" />
    </div>

    <div class="default-size">
      <el-input
        v-model="inputPrompt"
        :rows="5"
        type="textarea"
        resize="none"
        placeholder="enter发送，shift+enter或ctrl+enter换行"
        @keydown="handleKeydown"
      />
      <div class="btn">
        <!-- color="rgba(51, 97, 255, 1)" -->
        <el-button type="primary" :icon="Position" @click="sendMsg"> 发送 </el-button>
      </div>
    </div>

    <div class="small-size">
      <el-input
        v-model="inputPrompt"
        :rows="4"
        type="textarea"
        resize="none"
        placeholder="enter发送，shift+enter或ctrl+enter换行"
        @keydown="handleKeydown"
      />
      <div class="btn">
        <el-button color="rgba(51, 97, 255, 1)" :icon="Position" size="small" @click="sendMsg">
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Position } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { addMessage, getMessagesBySessionId, buildUserMessage } from '@/db/useMessagesRepo'
import { getCurSession, setAutoScrollEnabled } from './service/workspace'
import { chatWriter } from './service/useChat'

const curSession = getCurSession()
const inputPrompt = ref('')

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    if (e.shiftKey || e.ctrlKey) {
      e.preventDefault()
      inputPrompt.value += '\n'
    } else {
      e.preventDefault()
      sendMsg()
    }
  }
}

async function sendMsg() {
  if (inputPrompt.value.trim() === '') {
    ElMessage.warning('请输入内容')
  } else {
    const messages = await buildMessages()
    setAutoScrollEnabled(true)
    console.log(messages)
    chatWriter(messages)
    inputPrompt.value = ''
  }
}

async function buildMessages() {
  const message = buildUserMessage(curSession.value!.id, 0, inputPrompt.value)
  await addMessage(message)
  const messages = await getMessagesBySessionId(curSession.value!.id)
  return messages
}
</script>

<style lang="postcss" scoped>
.chat-input {
  position: relative;
  box-sizing: border-box;
  padding: 20px;
  width: 100%;

  .default-size {
    display: block;
  }

  .small-size {
    display: none;
  }

  :deep(.el-textarea__inner) {
    border-radius: 10px;
    box-shadow: none;
  }

  :deep(.el-textarea__inner) {
    box-shadow: 0px 10px 10px rgba(38, 51, 77, 0.1);
  }

  .btn {
    position: absolute;
    bottom: 30px;
    right: 30px;
  }

  .setting {
    position: absolute;
    top: 30px;
    right: 25px;
    z-index: 1;
    display: flex;
    align-items: center;

    label {
      font-size: 13px;
      color: #86929e;
      margin-right: 8px;
    }
  }

  @media (max-width: 500px) {
    &.chat-input {
      height: 115px;
    }

    .default-size {
      display: none;
    }

    .small-size {
      display: block;
    }
  }
}
</style>
