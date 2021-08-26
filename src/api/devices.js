import request from '@/utils/request'
//查询设备分页接口
export function devicePage(data) {
    return request({
        url: '/net/device/page',
        method: 'post',
        data
    })
}
//新增设备接口
export function deviceSave(data) {
    return request({
        url: '/net/device/save',
        method: 'post',
        data
    })
}
//更新设备接口
export function deviceUpdate(data) {
    return request({
        url: '/net/device/update',
        method: 'put',
        data
    })
}
//设备详情
export function deviceDetail(data) {
    return request({
        url: '/net/device/' + data,
        method: 'get',
    })
}
//删除设备接口，支持批量删除
export function deviceDelete(data) {
    return request({
        url: '/net/device/delete',
        method: 'delete',
        data
    })
}
//添加配置
export function deviceConfigSave(data) {
    return request({
        url: '/net/device/config/save',
        method: 'post',
        data
    })
}
//更新设备配置接口
export function deviceConfigUpdate(data) {
    return request({
        url: '/net/device/config/update',
        method: 'put',
        data
    })
}
//新增设备电池组信息
export function batteryGroupSave(data) {
    return request({
        url: '/net/batteryGroup/save',
        method: 'post',
        data
    })
}
//删除设备电池组信息
export function batteryGroupDelete(data) {
    return request({
        url: '/net/batteryGroup/delete',
        method: 'delete',
        data
    })
}
//更新设备电池组信息
export function batteryGroupUpdate(data) {
    return request({
        url: '/net/batteryGroup/update',
        method: 'put',
        data
    })
}
//查询设备电池组列表信息，不支持分页
export function batteryGroupList(data) {
    return request({
        url: '/net/batteryGroup/list',
        method: 'post',
        data
    })
}
//查询设备单个电池组详细信息
export function batteryGroupDetail(data) {
    return request({
        url: '/net/batteryGroup/' + data,
        method: 'get',
    })
}
//根据电池组ID关联电池列表信息，不支持分页
export function batteryList(data) {
    return request({
        url: '/net/battery/list',
        method: 'get',
        params: data
    })
}
//新增设备电池信息
export function batterySave(data) {
    return request({
        url: '/net/battery/save',
        method: 'post',
        data
    })
}
//修改设备电池信息
export function batteryUpdate(data) {
    return request({
        url: '/net/battery/update',
        method: 'put',
        data
    })
}
//删除设备电池信息
export function batteryDelete(data) {
    return request({
        url: '/net/battery/delete',
        method: 'delete',
        data
    })
}
//获取设备监控信息
export function deviceMonitor(id) {
    return request({
        url: '/net/device/monitor/' + id,
        method: 'get',
    })
}
//下载excel模板
export function downloadExcel() {
    return request({
        responseType: 'blob',
        url: '/net/device/downloadExcel',
        method: 'get',
    })
}
//批量导入设备
export function batchSave(data) {
    return request({
        // headers: {
        //     'Content-Type': 'multipart/form-data'
        // },
        url: '/net/device/batchSave',
        method: 'post',
        data
    })
}

//查询站点分页信息
export function stationPage(data) {
    return request({
        url: '/sys/station/page',
        method: 'post',
        data
    })
}

//获取设备日志信息
export function monitorRunLog(data) {
    return request({
        url: '/net/device/monitor/runLog',
        method: 'post',
        data
    })
}
//启动设备放电
export function startDischarge(id) {
    return request({
        url: '/net/device/monitor/startDischarge/' + id,
        method: 'put',
    })
}
//根据区域查询所有站点
export function stationTree(data) {
    return request({
        url: '/sys/station/tree',
        method: 'get',
        params: data
    })
}
//从设备下载配置到前端
export function configDownload(data) {
    return request({
        url: '/net/device/config/download',
        method: 'get',
        params: data
    })
}
//通过mqtt消息下发配置到设备
export function configUploadItem(data) {
    return request({
        url: '/net/device/config/upload',
        method: 'post',
        data
    })
}
/****固件升级相关*****/
export function uploadFile(data) {
  return request({
    url: '/sys/file/uploadFile',
    method: 'post',
    data
  })
}
export function saveSoft(data) {
  return request({
    url: '/net/device/soft/save',
    method: 'post',
    data
  })
}
export function delSoft(data) {
  return request({
    url: '/net/device/soft/delete',
    method: 'delete',
    data
  })
}
export function updateSoft(data) {
  return request({
    url: '/net/device/soft/update',
    method: 'put',
    data
  })
}
export function querySoft(data) {
  return request({
    url: '/net/device/soft/page',
    method: 'post',
    data
  })
}
export function deviceList(data) {
  return request({
    url: '/net/device/list',
    method: 'post',
    data
  })
}
export function saveRecord(data) {
  return request({
    url: '/net/device/soft/saveRecord',
    method: 'post',
    data
  })
}
export function getRecordList(data) {
  return request({
    url: '/net/device/soft/recordPage/' + data,
    method: 'get',
  })
}
export function startUpgrade(data) {
  return request({
    url: '/net/device/soft/startUpgrade',
    method: 'post',
    data
  })
}
//查询巡检任务列表，根据巡检人和状态可查询出待办列表
export function inspectionList(data) {
    return request({
        url: '/net/inspection/list',
        method: 'post',
        data
    })
}
//同步设备状态,获取设备监控信息
export function monitorSyncStatus(data) {
    return request({
        url: '/net/device/monitor/syncStatus',
        method: 'get',
        params: data
    })
}
