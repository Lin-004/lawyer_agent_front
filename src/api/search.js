import request from './request'

// 语义搜索
export function semanticSearch(data) {
  return request({
    url: '/search/semantic',
    method: 'post',
    data
  })
}

// 关键词搜索
export function keywordSearch(data) {
  return request({
    url: '/search/keyword',
    method: 'post',
    data
  })
}

