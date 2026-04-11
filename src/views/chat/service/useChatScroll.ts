import type { Ref } from 'vue'
import { nextTick } from 'vue'
import { getAutoScrollEnabled, enableAutoScroll, disableAutoScroll } from './workspace'

const DEFAULT_THRESHOLD_PX = 24

export type UseChatScrollOptions = {
  thresholdPx?: number
}

/**
 * 消息列表滚动：贴底跟随、用户上滑取消跟随、回到底部恢复。
 * 使用容器 scrollTop 置底，并对程序化滚动加短暂屏蔽，避免误触 disableAutoScroll。
 *
 * ResizeObserver 应由调用方挂在「随消息变高」的内容根节点上（见 attachResizeObserver），
 * 不要挂在固定高度的滚动容器上。
 */
export function useChatScroll(
  containerRef: Ref<HTMLElement | null>,
  options?: UseChatScrollOptions,
) {
  const thresholdPx = options?.thresholdPx ?? DEFAULT_THRESHOLD_PX
  const autoScrollEnabled = getAutoScrollEnabled()

  let rafId: number | null = null
  /** 已排队一个 nextTick，同 tick 内后续调用只合并状态，不再重复 queue */
  let nextTickFlushQueued = false
  let pendingAnotherFrame = false
  let forcePending = false
  let suppressUserScroll = false
  let disposed = false

  function isNearBottom(el: HTMLElement | null = containerRef.value): boolean {
    if (!el) {
      return true
    }
    return el.scrollHeight - el.scrollTop - el.clientHeight <= thresholdPx
  }

  function applyScrollTopToBottom() {
    const el = containerRef.value
    if (!el) {
      return
    }
    suppressUserScroll = true
    el.scrollTop = el.scrollHeight
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        suppressUserScroll = false
      })
    })
  }

  function runScheduledFrame() {
    if (disposed) {
      return
    }
    rafId = null

    const force = forcePending
    forcePending = false
    const runAgain = pendingAnotherFrame
    pendingAnotherFrame = false

    const shouldScroll = force || autoScrollEnabled.value
    if (shouldScroll) {
      applyScrollTopToBottom()
    }

    if (disposed) {
      return
    }

    if (runAgain) {
      scheduleScrollToBottom(false)
    }
  }

  function scheduleScrollToBottom(force: boolean = false) {
    if (disposed) {
      return
    }

    if (force) {
      enableAutoScroll()
      forcePending = true
    } else if (!autoScrollEnabled.value) {
      return
    }

    if (rafId !== null) {
      pendingAnotherFrame = true
      if (force) {
        forcePending = true
      }
      return
    }

    if (nextTickFlushQueued) {
      if (force) {
        enableAutoScroll()
        forcePending = true
      }
      return
    }

    nextTickFlushQueued = true
    nextTick(() => {
      nextTickFlushQueued = false
      if (disposed) {
        return
      }
      rafId = requestAnimationFrame(runScheduledFrame)
    })
  }

  function onUserScroll(ev: Event) {
    if (suppressUserScroll) {
      return
    }
    const el = ev.target as HTMLElement | null
    if (!el || el !== containerRef.value) {
      return
    }
    if (isNearBottom(el)) {
      enableAutoScroll()
    } else {
      disableAutoScroll()
    }
  }

  let resizeObserver: ResizeObserver | null = null

  /** 观察随消息列表变高的 DOM（通常为滚动容器内的内容根节点） */
  function attachResizeObserver(contentRootEl: HTMLElement) {
    detachResizeObserver()
    resizeObserver = new ResizeObserver(() => {
      scheduleScrollToBottom(false)
    })
    resizeObserver.observe(contentRootEl)
  }

  function detachResizeObserver() {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  }

  function dispose() {
    disposed = true
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    pendingAnotherFrame = false
    forcePending = false
    suppressUserScroll = false
    nextTickFlushQueued = false
    detachResizeObserver()
  }

  return {
    scheduleScrollToBottom,
    onUserScroll,
    isNearBottom,
    attachResizeObserver,
    dispose,
  }
}
