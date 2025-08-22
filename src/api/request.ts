import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

const request = axios.create({
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 1000 * 60,
})

// 获取填充数据
export async function fetchData(config: AxiosRequestConfig) {
  await request(config)
}

export { request }
