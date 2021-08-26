import request from '@/utils/request'

export function getAlarmItemList(data) {
  return request({
    url: 'net/alarm/item/list',
    method: 'post',
    data
  })
}
export function getAlarmItemPage(data) {
  return request({
    url: 'net/alarm/item/page',
    method: 'post',
    data
  })
}

export function saveAlarmItem(data) {
  return request({
    url: 'net/alarm/item/save',
    method: 'post',
    data
  })
}
export function updateAlarmItem(data) {
  return request({
    url: 'net/alarm/item/update',
    method: 'put',
    data
  })
}
export function delAlarmItem(data) {
  return request({
    url: 'net/alarm/item/delete',
    method: 'delete',
    data
  })
}

export function getAlarmStrategyPage(data) {
  return request({
    url: 'net/alarm/strategy/page',
    method: 'post',
    data
  })
}

export function saveAlarmStrategy(data) {
  return request({
    url: 'net/alarm/strategy/save',
    method: 'post',
    data
  })
}
export function updateAlarmStrategy(data) {
  return request({
    url: 'net/alarm/strategy/update',
    method: 'put',
    data
  })
}
export function delAlarmStrategy(data) {
  return request({
    url: 'net/alarm/strategy/delete',
    method: 'delete',
    data
  })
}

