import request from './request'

// 获取知识库文档列表
export function getKnowledgeList(params) {
  return request({
    url: '/knowledge/list',
    method: 'get',
    params
  })
}

// 上传知识库文档
export function uploadKnowledgeFile(formData) {
  return request({
    url: '/knowledge/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 删除知识库文档
export function deleteKnowledgeFile(id) {
  return request({
    url: `/knowledge/${id}`,
    method: 'delete'
  })
}

// 发布知识库文档
export function publishKnowledge(id) {
  return request({
    url: `/knowledge/publish/${id}`,
    method: 'post'
  })
}

// 禁用知识库文档
export function disableKnowledge(id) {
  return request({
    url: `/knowledge/disable/${id}`,
    method: 'post'
  })
}


