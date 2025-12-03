import request from './request'

// SSE流式对话
export function sseChat(params) {
  const token = localStorage.getItem('token')
  return fetch(`/api/ai/lower_app/sse?message=${encodeURIComponent(params.message)}&chatId=${params.chatId}`, {
    method: 'GET',
    headers: {
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }).then((response) => {
    if (!response.ok) {
      const error = new Error('SSE request failed')
      error.status = response.status
      throw error
    }
    return response
  })
}

// 获取最近消息
export function getRecentMessages(params) {
  return request({
    url: '/ai/lower_app/recent',
    method: 'get',
    params
  })
}

// 清理会话
export function clearChat(chatId) {
  return request({
    url: '/ai/lower_app/clear',
    method: 'delete',
    params: { chatId }
  })
}

// 发送系统消息
export function sendSystemMessage(params) {
  return request({
    url: '/ai/lower_app/system',
    method: 'post',
    params
  })
}

