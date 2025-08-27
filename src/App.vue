<template>
  <router-view v-slot="{ Component }">
    <transition>
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped></style>
