import { v4 as uuidv4 } from 'uuid'

function getUUID() {
  return uuidv4()
}

function generateRandomNumber(maxNum: number) {
  return Math.floor(Math.random() * maxNum) + 1
}

// js实现的睡眠函数
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 复制文本
function copyTextToClipboard(text: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text

  // 避免页面滚动
  textarea.style.position = 'fixed'
  textarea.style.top = '0'
  textarea.style.left = '0'
  textarea.style.width = '1px'
  textarea.style.height = '1px'
  textarea.style.opacity = '0'

  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()

  try {
    const successful = document.execCommand('copy')
    return successful
  } catch (err) {
    console.error('复制失败', err)
    return false
  } finally {
    document.body.removeChild(textarea)
  }
}

export { getUUID, generateRandomNumber, sleep, copyTextToClipboard }
