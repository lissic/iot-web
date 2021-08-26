import request from "@/utils/request"

//系统监控总览
export function serverOverview(data) {
    return request({
        url: '/report/server/overview',
        method: 'get',
        params: data
    })
}
//根据设备状态分类统计数量
export function withStatus(data) {
    return request({
        url: '/report/device/statistics/withStatus',
        method: 'get',
        params: data
    })
}
//根据告警级别统计告警数量
export function withAlarm(data) {
    return request({
        url: '/report/device/statistics/withAlarm',
        method: 'get',
        params: data
    })
}
//统计设备告警前10的信息
export function withDeviceAlarm(data) {
    return request({
        url: '/report/device/statistics/withDeviceAlarm',
        method: 'get',
        params: data
    })
}
//根据时间段的不同统计系统所有告警消息数量
export function withAlarmTime(data) {
    return request({
        url: '/report/device/statistics/withAlarmTime',
        method: 'get',
        params: data
    })
}

//统计各站点设备数量
export function withStation() {
    return request({
        url: '/report/device/statistics/withStation',
        method: 'get',
    })
}
