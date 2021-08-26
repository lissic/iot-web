import request from '@/utils/request'

export function menuTree(data) {
  return request({
    url: '/sys/menu/tree',
    method: 'post',
    data
  })
}

export function saveMenu(data) {
  return request({
    url: '/sys/menu/save',
    method: 'post',
    data
  })
}

export function deleteMenu(data) {
  return request({
    url: '/sys/menu/delete',
    method: 'delete',
    data
  })
}

export function updateMenu(data) {
  return request({
    url: '/sys/menu/update',
    method: 'put',
    data
  })
}

export function queryMenuList(data) {
  return request({
    url: '/sys/menu/list',
    method: 'post',
    data
  })
}

