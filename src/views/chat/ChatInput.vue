<template>
  <div class="chat-input">
    <div class="setting cursor-pointer flex items-center">
      <label class="text-[12px] text-[#86929e] mr-[8px]">记录对话</label>
      <el-switch class="mr-[8px]" :active-value="false" :inactive-value="true" size="small" />
    </div>

    <div class="default-size">
      <el-input
        v-model="inputPrompt"
        :rows="8"
        type="textarea"
        resize="none"
        placeholder="enter发送，shift+enter或ctrl+enter换行"
        @keydown="handleKeydown"
      />
      <div class="btn">
        <el-button color="rgba(51, 97, 255, 1)" :icon="Position" @click="sendTest"> AI </el-button>
        <el-button color="rgba(51, 97, 255, 1)" :icon="Position" @click="sendMsg"> 发送 </el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { useMessagesRepo } from '@/db/useMessagesRepo'
import { getCurSession, getLastAiMsg } from './service/workspace'

const curSession = getCurSession()
const lastAiMsg = getLastAiMsg()
const inputPrompt = ref('')
const { addMessage, buildAiMessage, buildUserMessage } = useMessagesRepo()

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

async function sendTest() {
  if (inputPrompt.value.trim() === '') {
    ElMessage.warning('请输入内容')
  } else {
    const message = buildAiMessage(curSession.value!.id, 0, inputPrompt.value)
    await addMessage(message)
    console.log(inputPrompt.value)
    inputPrompt.value = ''
  }
}

async function sendMsg() {
  if (inputPrompt.value.trim() === '') {
    ElMessage.warning('请输入内容')
  } else {
    const message = buildUserMessage(curSession.value!.id, 0, inputPrompt.value)
    await addMessage(message)
    console.log(inputPrompt.value)
    inputPrompt.value = ''
  }
}

function handleClearMsg() {
  ElMessageBox.confirm('确认清空对话记录吗？', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
    customStyle: {
      position: 'relative',
      top: '-10%',
    },
  }).then(() => {
    // clearMsg()
  })
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
