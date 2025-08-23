import { fetchData } from './request'
import type { SummaryRequest, RespModel } from '@/schema/base.api'
import type { SummaryItem } from '@/schema/summary'

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

// offset 分页
export function getSummarysByOffset(tenant_name: string, size: number = 10, page: number = 1) {
  return fetchData<RespModel<SummaryItem>>({
    url: `/rpg-mt/vector_db/summary/${tenant_name}/offset`,
    method: 'get',
    params: {
      size,
      page,
    },
  })
}

// 游标分页
export function getSummarysByCursor(
  tenant_name: string,
  cursor: string | null = null,
  limit: number = 10,
) {
  return fetchData<RespModel<SummaryItem>>({
    url: `/rpg-mt/vector_db/summary/${tenant_name}/cursor`,
    method: 'get',
    params: {
      cursor,
      limit,
    },
  })
}

// 摘要搜索
export function searchSummary(
  tenant_name: string,
  query: string,
  mode: string,
  distance: number,
  k: number,
) {
  return fetchData<RespModel<SummaryItem>>({
    url: `/rpg-mt/vector_db/summary/${tenant_name}/search`,
    method: 'get',
    params: {
      query,
      mode,
      distance,
      k,
    },
  })
}
