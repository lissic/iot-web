import request from '@/utils/request'

//查询日志分页列表
export function logPage(data) {
    return request({
        url: '/sys/log/page',
        method: 'post',
        data
    })
}