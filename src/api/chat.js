import request from './request'

// 获取聊天历史（可按 chatId 或者 user/lawyer）
export function getChatHistory(params) {
  return request({
    url: '/chat/history',
    method: 'get',
    params
  })
}

// 发送消息到律师/用户
export function sendMessage(data) {
  return request({
    url: '/chat/send',
    method: 'post',
    data
  })
}

// 创建或获取会话（可选）
export function createChat(data) {
  return request({
    url: '/chat/create',
    method: 'post',
    data
  })
}

export default {
  getChatHistory,
  sendMessage,
  createChat
}
