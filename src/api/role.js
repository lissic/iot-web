import request from '@/utils/request'

export function saveRole(data) {
  return request({
    url: '/sys/role/save',
    method: 'post',
    data
  })
}

export function deleteRole(data) {
  return request({
    url: '/sys/role/delete',
    method: 'delete',
    data
  })
}

export function updateRole(data) {
  return request({
    url: '/sys/role/update',
    method: 'put',
    data
  })
}

export function queryRoleList(data) {
  return request({
    url: '/sys/role/list',
    method: 'post',
    data
  })
}

export function queryRolePage(data) {
  return request({
    url: '/sys/role/page',
    method: 'post',
    data
  })
}

