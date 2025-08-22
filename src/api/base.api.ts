import { fetchData } from './request'
import type { SummaryRequest } from '@/schema/base.api'

// 新增租户
export function addTenant(tenant_name: string) {
  return fetchData({
    url: '/rpg-mt/vector_db/summary/tenants',
    method: 'post',
    data: {
      tenant_name,
    },
  })
}

// 删除租户
export function deleteTenant(tenant_name: string) {
  return fetchData({
    url: '/rpg-mt/vector_db/summary/tenants/' + tenant_name,
    method: 'delete',
  })
}

// 摘要生成
export async function generateSummary(data: SummaryRequest) {
  return fetchData({
    url: '/rpg-mt/chat/summary',
    method: 'post',
    data,
    timeout: 1000 * 60 * 5,
  })
}
