import { fetchData } from './request'
import type { SummaryRequest, RespModel, ChatBaseModel } from '@/schema/base.api'
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

// 更新摘要
export function updateSummary(
  tenant_name: string,
  uuid: string,
  summary: string,
  turn: number | undefined,
) {
  return fetchData({
    url: `/rpg-mt/vector_db/summary/${tenant_name}/${uuid}`,
    method: 'put',
    data: {
      summary,
      turn,
    },
  })
}

// 删除摘要
export function deleteSummary(tenant_name: string, uuid: string) {
  return fetchData({
    url: `/rpg-mt/vector_db/summary/${tenant_name}/${uuid}`,
    method: 'delete',
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
  top_k: number,
) {
  return fetchData<RespModel<SummaryItem>>({
    url: `/rpg-mt/vector_db/summary/${tenant_name}/search`,
    method: 'post',
    data: {
      query,
      mode,
      distance,
      top_k,
    },
  })
}

// 基础chat接口
export function chat(data: ChatBaseModel) {
  return fetchData<{ message: string; content: string }>({
    url: '/rpg-mt/chat/base',
    method: 'post',
    data,
  })
}
