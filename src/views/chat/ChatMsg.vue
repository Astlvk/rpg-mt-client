<template>
  <div
    class="message-item"
    :class="{ 'message-user': message.type === 'user', 'message-bot': message.type === 'bot' }"
  >
    <div class="message-avatar">
      <el-avatar :size="36" :src="avatarSrc">
        <el-icon v-if="message.type === 'user'"><User /></el-icon>
        <el-icon v-else><Service /></el-icon>
      </el-avatar>
    </div>

    <div class="message-content">
      <div class="message-text">{{ message.content }}</div>
      <div class="message-time">{{ message.time }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { User, Service } from '@element-plus/icons-vue'

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  userAvatar: {
    type: String,
    default: '',
  },
  botAvatar: {
    type: String,
    default: '',
  },
})

const avatarSrc = computed(() => {
  return props.message.type === 'user' ? props.userAvatar : props.botAvatar
})
</script>

<style lang="postcss" scoped>
.message-item {
  display: flex;
  margin-bottom: 20px;

  &.message-user {
    flex-direction: row-reverse;

    .message-content {
      margin-left: 0;
      margin-right: 12px;
      align-items: flex-end;
    }

    .message-text {
      background-color: #409eff;
      color: #fff;
      border-radius: 18px 18px 4px 18px;
    }
  }

  &.message-bot {
    .message-text {
      background-color: #fff;
      color: #303133;
      border-radius: 18px 18px 18px 4px;
      border: 1px solid #e4e7ed;
    }
  }
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message-text {
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.message-time {
  font-size: 11px;
  color: #c0c4cc;
  margin-top: 4px;
}
</style>
