import request from '@/utils/request'

// 查询资产详情
export function assetDetails(data) {
  return request({
    url: '/net/assets/findDetails/' + data,
    method: 'get',
  })
}
// 查询资产列表
export function assetList(data) {
  return request({
    url: '/net/assets/list',
    method: 'post',
    data
  })
}

// 查询资产分页
export function assetPage(data) {
  return request({
    url: '/net/assets/page',
    method: 'post',
    data
  })
}

// 新增资产
export function assetSave(data) {
  return request({
    url: '/net/assets/add',
    method: 'post',
    data
  })
}

// 更新资产
export function assetUpdate(data) {
  return request({
    url: '/net/assets/modify',
    method: 'put',
    data
  })
}

// 删除资产
export function assetDelete(data) {
  return request({
    url: '/net/assets/delete',
    method: 'delete',
    data
  })
}

// 批量导出资产
export function assetExport(data) {
  return request({
    url: '/net/assets/batchExport',
    method: 'post',
    data
  })
}

// 上传资产图片
export function assetPicUpload(data) {
  return request({
    url: '/sys/file/uploadPic',
    method: 'post',
    data
  })
}
