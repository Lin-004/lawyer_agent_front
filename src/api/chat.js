import request from './request'

// REST API wrappers
export function getSessionList() {
  return request({
    url: '/consult/session/list',
    method: 'get'
  })
}

export function getMessageList(params) {
  // params: { sessionId, pageNum, pageSize }
  return request({
    url: '/consult/message/list',
    method: 'get',
    params
  })
}

export function createSession(lawyerId) {
  return request({
    url: `/consult/session/create?lawyerId=${lawyerId}`,
    method: 'post'
  })
}

export function clearUnread(sessionId) {
  return request({
    url: `/consult/session/clearUnread?sessionId=${sessionId}`,
    method: 'patch'
  })
}

// WebSocket wrapper with reconnect and heartbeat
class ChatSocket {
  constructor({ url, token, onMessage, onOpen, onClose, onError, heartbeatInterval = 20000 }) {
    this.baseUrl = url
    this.token = token
    this.onMessage = onMessage
    this.onOpen = onOpen
    this.onClose = onClose
    this.onError = onError
    this.heartbeatInterval = heartbeatInterval

    this.ws = null
    this.forcedClose = false
    this.reconnectDelay = 1000
    this.maxReconnectDelay = 30000
    this.heartbeatTimer = null
    this.reconnectTimer = null
  }

  connect() {
    if (!this.token) {
      throw new Error('Missing token for WebSocket connection')
    }
    const wsUrl = `${this.baseUrl}/${this.token}`
    this.forcedClose = false
    this._open(wsUrl)
  }

  _open(wsUrl) {
    try {
      this.ws = new WebSocket(wsUrl)
    } catch (e) {
      this._scheduleReconnect()
      return
    }

    this.ws.onopen = (ev) => {
      this.reconnectDelay = 1000
      this._startHeartbeat()
      if (this.onOpen) this.onOpen(ev)
    }

    this.ws.onmessage = (ev) => {
      let data = null
      try {
        data = JSON.parse(ev.data)
      } catch (e) {
        // non-json message, ignore
      }
      if (this.onMessage) this.onMessage(data)
    }

    this.ws.onclose = (ev) => {
      this._stopHeartbeat()
      if (this.onClose) this.onClose(ev)
      if (!this.forcedClose) this._scheduleReconnect()
    }

    this.ws.onerror = (ev) => {
      if (this.onError) this.onError(ev)
    }
  }

  send(payload) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false
    }
    const str = typeof payload === 'string' ? payload : JSON.stringify(payload)
    this.ws.send(str)
    return true
  }

  close() {
    this.forcedClose = true
    this._stopHeartbeat()
    if (this.ws) {
      try {
        this.ws.close()
      } catch (e) {}
    }
    this.ws = null
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  _startHeartbeat() {
    this._stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      try {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'ping', time: Date.now() }))
        }
      } catch (e) {}
    }, this.heartbeatInterval)
  }

  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  _scheduleReconnect() {
    if (this.reconnectTimer || this.forcedClose) return
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay)
      this._open(`${this.baseUrl}/${this.token}`)
    }, this.reconnectDelay)
  }
}

// Factory helper. Default ws base is ws://localhost:8081/ws
export function createChatSocket({ token, onMessage, onOpen, onClose, onError, baseUrl = 'ws://localhost:8081/api/ws' } = {}) {
  const s = new ChatSocket({ url: baseUrl, token, onMessage, onOpen, onClose, onError })
  return s
}

// getChatHistory: 必须传入 sessionId，严格对接 consult/message/list
// 不再回退到不存在的 legacy endpoint
export function getChatHistory(params) {
  if (params && params.sessionId) {
    return getMessageList({ sessionId: params.sessionId, pageNum: params.pageNum || 1, pageSize: params.pageSize || 50 })
      .then(res => (res && res.data && res.data.records) ? res.data.records : res)
  }
  return Promise.reject(new Error('getChatHistory requires params.sessionId (use createSession first)'))
}

// sendMessage: 不再提供 REST 接口（后端未定义）
// 改用 WebSocket 发送或通过 Pinia store 代理
// 预期消息格式: { sessionId, receiverId, content, type: 'text'|'image'|... }
// WebSocket 会自动补充 senderId 和时间戳
export function sendMessage(data) {
  return Promise.reject(new Error('sendMessage via REST is not supported. Use WebSocket send or the chat store sendMessage.'))
}

// createChat: 映射到 consult/session/create
// 必须提供 lawyerId，否则拒绝
export function createChat(data) {
  if (data && data.lawyerId) {
    return createSession(data.lawyerId).then(res => ({ id: res?.data ?? res }))
  }
  return Promise.reject(new Error('createChat requires lawyerId (use consult/session/create)'))
}

export default {
  getSessionList,
  getMessageList,
  createSession,
  clearUnread,
  createChatSocket,
  getChatHistory,
  createChat,
  sendMessage
}

