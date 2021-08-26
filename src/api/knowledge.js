
import request from '@/utils/request'

// 分页查询知识库
export function knowledgePage(data) {
  return request({
    url: '/net/knowledge/page',
    method: 'post',
    data
  })
}

export function knowledgeDetails(data) {
  return request({
    url:'/net/knowledge/'+data,
    method: 'get'
  })
}

// 新增知识库
export function knowledgeSave(data) {
  return request({
    url: '/net/knowledge/add',
    method: 'post',
    data
  })
}

// 更新知识库
export function knowledgeUpdate(data) {
  return request({
    url: '/net/knowledge/modify',
    method: 'put',
    data
  })
}

// 更新浏览量
export function updateCount(data) {
  return request({
    url: '/net/knowledge/updateCount',
    method: 'put',
    data
  })
}

// 删除知识库
export function knowledgeDelete(data) {
  return request({
    url: '/net/knowledge/delete',
    method: 'delete',
    data
  })
}

// 上传附件
export function fileUpload(data) {
  return request({
    url: '/sys/file/uploadFile',
    method: 'post',
    data
  })
}
