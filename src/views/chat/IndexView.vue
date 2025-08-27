<template>
  <div class="chat-view">
    <ChatInterface />
  </div>
</template>

<script setup lang="ts">
import ChatInterface from '@/views/chat/ChatInterface.vue'
</script>

<style lang="postcss" scoped>
.chat-view {
  height: 100vh;
  width: 100%;
}
</style>
