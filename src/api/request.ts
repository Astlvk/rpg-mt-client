import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 1000 * 60,
})

// 获取填充数据
export async function fetchData<T>(config: AxiosRequestConfig) {
  console.log(import.meta.env.VITE_APP_BASE_URL)
  const res = await request<T>(config)
  return res.data
}

export { request }
