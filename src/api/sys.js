import request from '@/utils/request'

// 查询区域列表接口
export function areaList(data) {
  return request({
    url: '/sys/station/list',
    method: 'post',
    data
  })
}
// 查询区域列表
export function areaPage(data) {
  return request({
    url: '/sys/station/page',
    method: 'post',
    data
  })
}
// 新增区域接口
export function areaAdd(data) {
  return request({
    url: '/sys/station/save',
    method: 'post',
    data
  })
}
// 修改区域接口
export function areaModify(data) {
  return request({
    url: '/sys/station/update',
    method: 'put',
    data
  })
}
// 删除区域接口
export function areaDelete(data) {
  return request({
    url: '/sys/station/delete',
    method: 'delete',
    data
  })
}
// 部门管理--列表查询
export function deptList(data) {
  return request({
    url: '/sys/dept/list',
    method: 'post',
    data
  })
}

// 部门管理--分页查询
export function deptPage(data) {
  return request({
    url: '/sys/dept/page',
    method: 'post',
    data
  })
}

// 部门管理--查询部门树
export function deptTree(data) {
  return request({
    url: '/sys/dept/tree',
    method: 'post',
    params: data
  })
}

// 部门管理--根据Id查询
export function deptById(data) {
  return request({
    url: '/sys/dept/' + data,
    method: 'get'
  })
}

// 部门管理--新增部门
export function deptSave(data) {
  return request({
    url: '/sys/dept/save',
    method: 'post',
    data
  })
}

// 部门管理--更新部门
export function deptUpdate(data) {
  return request({
    url: '/sys/dept/update',
    method: 'put',
    data
  })
}

// 部门管理--更新状态
export function statusUpdate(data) {
  return request({
    url: '/sys/dept/updateStatus',
    method: 'post',
    data
  })
}

// 部门管理--删除部门
export function deptDelete(data) {
  return request({
    url: '/sys/dept/delete',
    method: 'delete',
    data
  })
}

// 系统设置--新增设置
export function settingSave(data) {
  return request({
    url: '/sys/setting/save',
    method: 'post',
    data
  })
}

// 系统设置--查询设置
export function settingPage(data) {
  return request({
    url: '/sys/setting/page',
    method: 'post',
    data
  })
}

// 系统管理--运维管理--告警清除
export function alarmPage(data) {
  return request({
    url: '/net/alarm/page',
    method: 'post',
    data
  })
}

// 系统管理--运维管理--任务管理
export function taskPage(data) {
  return request({
    url: '/net/task/page',
    method: 'post',
    data
  })
}
// 系统管理--运维管理--任务管理--新增
export function taskSave(data) {
  return request({
    url: '/net/task/save',
    method: 'post',
    data
  })
}
// 系统管理--运维管理--任务管理--更新
export function taskUpdate(data) {
  return request({
    url: '/net/task/update',
    method: 'put',
    data
  })
}
// 系统管理--运维管理--任务管理--启动
export function startTask(data) {
  return request({
    url: '/net/task/startTask',
    method: 'get',
    params: data
  })
}
// // 系统管理--运维管理--任务管理--启动
export function stopTask(data) {
  return request({
    url: '/net/task/stopTask',
    method: 'get',
    params: data
  })
}
// 系统管理--运维管理--任务管理--删除
export function taskDelete(data) {
  return request({
    url: '/net/task/delete',
    method: 'delete',
    data
  })
}
// 系统管理--运维管理-告警清除--处理
export function alarmUpdateStatus(data) {
    return request({
        url: '/net/alarm/updateStatus',
        method: 'put',
        data
    })
}
// 系统管理--运维管理-告警清除--详情
export function alarmDetails(data) {
    return request({
        url: '/net/alarm/' + data,
        method: 'get',
        // data
    })
}

