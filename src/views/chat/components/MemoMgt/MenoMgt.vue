<template>
  <el-drawer
    v-model="open"
    size="100%"
    append-to-body
    destroy-on-close
    :z-index="1001"
    header-class="memo-mgt-drawer-header-class"
    style="--el-drawer-padding-primary: 10px"
    @open="handleOpen"
    @close="handleClose"
  >
    <template #header>
      <el-tabs v-model="activeName" type="card">
        <el-tab-pane label="摘要列表" name="summary" />
        <el-tab-pane label="摘要搜索" name="retrieval" />
      </el-tabs>
    </template>

    <template v-if="tenantName">
      <div class="memo-mgt">
        <MemoList v-show="activeName === 'summary'" :tenantName="tenantName" />
        <MemoSearch v-show="activeName === 'retrieval'" :tenantName="tenantName" />
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MemoList from './MemoList.vue'
import MemoSearch from './MemoSearch.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  tenantName: {
    type: String,
    default: null,
  },
})
const emit = defineEmits(['update:modelValue'])
const open = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

const activeName = ref('summary')

const handleOpen = () => {
  open.value = true
}

const handleClose = () => {
  open.value = false
}
</script>

<style lang="postcss">
.memo-mgt-drawer-header-class {
  margin-bottom: 0;
}
</style>

<style lang="postcss" scoped>
.memo-mgt {
  height: 100%;
  width: 100%;
  background-color: #fff;
}
</style>
