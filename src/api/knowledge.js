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


