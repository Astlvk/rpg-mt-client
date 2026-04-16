import type { Ref } from 'vue'
import { nextTick } from 'vue'
import { getAutoScrollEnabled, enableAutoScroll, disableAutoScroll } from './workspace'

const DEFAULT_THRESHOLD_PX = 24
const USER_INTENT_WINDOW_MS = 260

export type UseChatScrollOptions = {
  thresholdPx?: number
}

/**
 * 消息列表滚动：
 * 1. 默认跟随流式输出置底；
 * 2. 用户上滚时停止自动置底；
 * 3. 仅在“用户主动向下滚 + 接近底部”时恢复自动置底；
 * 4. 自动置底关闭时不做程序化滚动，避免可视区漂移。
 */
export function useChatScroll(
  containerRef: Ref<HTMLElement | null>,
  options?: UseChatScrollOptions,
) {
  const thresholdPx = options?.thresholdPx ?? DEFAULT_THRESHOLD_PX
  const autoScrollEnabled = getAutoScrollEnabled()

  let rafId: number | null = null
  let nextTickFlushQueued = false
  let pendingAnotherFrame = false
  let forcePending = false
  let suppressUserScroll = false
  let disposed = false

  let resizeObserver: ResizeObserver | null = null

  let lastObservedScrollTop = 0
  let userIntentUntil = 0

  function isNearBottom(el: HTMLElement | null = containerRef.value): boolean {
    if (!el) {
      return true
    }
    return el.scrollHeight - el.scrollTop - el.clientHeight <= thresholdPx
  }

  function markUserIntent() {
    userIntentUntil = Date.now() + USER_INTENT_WINDOW_MS
  }

  function hasRecentUserIntent() {
    return Date.now() <= userIntentUntil
  }

  function handleWheel() {
    markUserIntent()
  }

  function handleTouchMove() {
    markUserIntent()
  }

  function handlePointerDown() {
    markUserIntent()
  }

  function releaseSuppressedUserScroll() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        suppressUserScroll = false
      })
    })
  }

  function applyScrollTopToBottom() {
    const el = containerRef.value
    if (!el) {
      return
    }

    suppressUserScroll = true
    el.scrollTop = el.scrollHeight
    lastObservedScrollTop = el.scrollTop
    releaseSuppressedUserScroll()
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
    const el = ev.target as HTMLElement | null
    if (!el || el !== containerRef.value) {
      return
    }

    const currentTop = el.scrollTop

    // suppress 期间不改自动跟随开关，但保持滚动方向基线更新，避免后续误判方向。
    if (suppressUserScroll) {
      lastObservedScrollTop = currentTop
      return
    }

    const delta = currentTop - lastObservedScrollTop
    lastObservedScrollTop = currentTop

    const nearBottom = isNearBottom(el)
    if (!nearBottom) {
      disableAutoScroll()
      return
    }

    const isUserScrollingDown = delta > 0
    if (isUserScrollingDown && hasRecentUserIntent()) {
      enableAutoScroll()
    }
  }

  function attachResizeObserver(contentRootEl: HTMLElement) {
    detachResizeObserver()

    lastObservedScrollTop = containerRef.value?.scrollTop ?? 0

    const containerEl = containerRef.value
    if (containerEl) {
      containerEl.addEventListener('wheel', handleWheel, { passive: true })
      containerEl.addEventListener('touchmove', handleTouchMove, { passive: true })
      containerEl.addEventListener('pointerdown', handlePointerDown, { passive: true })
    }

    resizeObserver = new ResizeObserver(() => {
      const el = containerRef.value
      if (!el) {
        return
      }

      if (!autoScrollEnabled.value) {
        // 用户已关闭自动跟随时，保持当前位置，不做程序化滚动。
        lastObservedScrollTop = el.scrollTop
        return
      }

      scheduleScrollToBottom(false)
    })

    resizeObserver.observe(contentRootEl)
  }

  function detachResizeObserver() {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }

    const containerEl = containerRef.value
    if (containerEl) {
      containerEl.removeEventListener('wheel', handleWheel)
      containerEl.removeEventListener('touchmove', handleTouchMove)
      containerEl.removeEventListener('pointerdown', handlePointerDown)
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
