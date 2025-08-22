import { fetchData } from './request'

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
