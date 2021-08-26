import request from '@/utils/request'

// 开始巡检
export function inspectionStart(data) {
  return request({
    url: 'net/inspection/startInspection/' + data,
    method: 'put',
  })
}
// 新增巡检
export function inspectionSave(data) {
  return request({
    url: 'net/inspection/save',
    method: 'post',
    data
  })
}

// 保存巡检结果
export function inspectionResult(data) {
  return request({
    url: 'net/inspection/saveResult',
    method: 'post',
    data
  })
}

// 更新巡检
export function inspectionUpdate(data) {
  return request({
    url: 'net/inspection/update',
    method: 'put',
    data
  })
}

// 删除巡检
export function inspectionDelete(data) {
  return request({
    url: 'net/inspection/delete',
    method: 'delete',
    data
  })
}

// 查询巡检分页
export function inspectionPage(data) {
  return request({
    url: 'net/inspection/page',
    method: 'post',
    data
  })
}

// 上传巡检结果照片
export function inspectPicUpload(data) {
  return request({
    url: '/sys/file/uploadPic',
    method: 'post',
    data
  })
}
