import { defineStore } from 'pinia'
import { ref, reactive, computed, nextTick } from 'vue'
import chatApi, { createChatSocket } from '@/api/chat'
import { useUserStore } from '@/stores/user'

// Utility to get token from localStorage
function getToken() {
  return localStorage.getItem('token') || ''
}

export const useChatStore = defineStore('chat', () => {
  const sessions = ref([]) // array of { sessionId, targetId, targetName, targetAvatar, lastMessage, lastMessageTime, unreadCount }
  const messages = reactive({}) // { [sessionId]: { records: [], total, pageNum } }
  const currentSessionId = ref(null)
  const wsState = ref('closed') // 'closed'|'connecting'|'open'
  const socket = ref(null)
  const chatContainerRef = ref(null) // DOM ref for auto-scroll

  // load sessions from backend
  async function loadSessions() {
    try {
      const res = await chatApi.getSessionList()
      if (res && res.data) {
        sessions.value = res.data
      } else {
        sessions.value = []
      }
    } catch (e) {
      console.error('loadSessions error', e)
      sessions.value = []
    }
  }

  // load messages (pageNum starts at 1)
  async function loadMessages(sessionId, pageNum = 1, pageSize = 20) {
    if (!sessionId) return
    try {
      const params = { sessionId, pageNum, pageSize }
      const res = await chatApi.getMessageList(params)
      if (res && res.data && res.data.records) {
        const page = messages[sessionId] || { records: [], total: 0, pageNum: 0 }
        // Sort by timestamp to ensure chronological order (oldest first)
        const sortedRecords = res.data.records.slice().sort((a, b) => {
          const timeA = new Date(a.time).getTime()
          const timeB = new Date(b.time).getTime()
          return timeA - timeB
        })
        
        if (pageNum === 1) {
          page.records = sortedRecords
        } else {
          // prepend older messages
          page.records = sortedRecords.concat(page.records)
        }
        page.total = res.data.total || page.total
        page.pageNum = pageNum
        messages[sessionId] = page
        // after loading, scroll to bottom
        await nextTick()
        _scrollToBottom()
      }
    } catch (e) {
      console.error('loadMessages error', e)
    }
  }

  // create or get session by lawyerId
  async function createSession(lawyerId) {
    const res = await chatApi.createSession(lawyerId)
    if (res && res.data) {
      const sid = res.data
      return sid
    }
    return null
  }

  async function clearUnread(sessionId) {
    try {
      await chatApi.clearUnread(sessionId)
      // update local sessions
      const s = sessions.value.find((x) => x.sessionId === sessionId)
      if (s) s.unreadCount = 0
    } catch (e) {
      console.error('clearUnread error', e)
    }
  }

  // Open session: set current, clear unread and load messages
  async function openSession(sessionId) {
    currentSessionId.value = sessionId
    await clearUnread(sessionId)
    await loadMessages(sessionId, 1)
  }

  // send via WebSocket; also push locally optimistically
  // Expected to receive from backend: { sessionId, senderId, receiverId, content, type, isRead, time }
  function sendMessage({ sessionId, receiverId, content, type = 'text' }) {
    if (!sessionId) {
      console.error('sendMessage: sessionId is required')
      return false
    }
    if (!socket.value) {
      console.error('sendMessage: WebSocket socket is not initialized')
      return false
    }
    if (socket.value.ws && socket.value.ws.readyState !== WebSocket.OPEN) {
      console.error(`sendMessage: WebSocket is not open (state: ${socket.value.ws.readyState})`)
      return false
    }
    
    const payload = { sessionId, receiverId, content, type }
    let ok = false
    try {
      ok = socket.value.send(payload)
      if (!ok) {
        console.warn('sendMessage: socket.send() returned false (socket may not be ready)')
      }
    } catch (e) {
      console.error('sendMessage: error sending via WebSocket', e)
      ok = false
    }
    
    // optimistic local push with actual backend fields
    const tempMsg = {
      id: `t_${Date.now()}`,
      senderId: useUserStore().userId,  // current user's ID
      receiverId,
      content,
      type,
      isRead: 1,
      time: new Date().toISOString()
    }
    if (!messages[sessionId]) messages[sessionId] = { records: [], total: 0, pageNum: 1 }
    messages[sessionId].records.push(tempMsg)
    // update session lastMessage
    const s = sessions.value.find((x) => x.sessionId === sessionId)
    if (s) {
      s.lastMessage = content
      s.lastMessageTime = tempMsg.time
    }
    nextTick(_scrollToBottom)
    return ok
  }

  function _onWsMessage(data) {
    if (!data) return
    // Backend message format: { id, sessionId, senderId, receiverId, content, type, isRead, time }
    const sid = data.sessionId
    if (!sid) return
    if (!messages[sid]) messages[sid] = { records: [], total: 0, pageNum: 1 }
    
    // Push message with all backend fields
    messages[sid].records.push(data)

    // update session list: last message/time and unread
    let s = sessions.value.find((x) => x.sessionId === sid)
    if (!s) {
      // create lightweight session entry when unknown
      s = {
        sessionId: sid,
        targetId: data.senderId === useUserStore().userId ? data.receiverId : data.senderId,
        targetName: data.senderName || '对方',
        targetAvatar: data.senderAvatar || '',
        lastMessage: data.content,
        lastMessageTime: data.time,
        unreadCount: 0
      }
      sessions.value.unshift(s)
    } else {
      s.lastMessage = data.content
      s.lastMessageTime = data.time
    }

    // increment unread if not active session
    if (currentSessionId.value !== sid) {
      s.unreadCount = (s.unreadCount || 0) + 1
    }
    // if active session, mark message as read locally
    if (currentSessionId.value === sid) {
      // nothing else required here; backend usually handles marking read when open
      nextTick(_scrollToBottom)
    }
  }

  function _onWsOpen() {
    wsState.value = 'open'
  }

  function _onWsClose() {
    wsState.value = 'closed'
  }

  function _onWsError(e) {
    console.error('ws error', e)
  }

  // initialize websocket connection
  function initSocket() {
    const token = getToken()
    if (!token) return
    wsState.value = 'connecting'
    if (socket.value) {
      try {
        socket.value.close()
      } catch (e) {}
    }
    const s = createChatSocket({
      token,
      onMessage: (data) => _onWsMessage(data),
      onOpen: _onWsOpen,
      onClose: _onWsClose,
      onError: _onWsError
    })
    socket.value = s
    try {
      s.connect()
    } catch (e) {
      console.error('socket connect error', e)
    }
  }

  function closeSocket() {
    if (socket.value) {
      try {
        socket.value.close()
      } catch (e) {}
      socket.value = null
    }
    wsState.value = 'closed'
  }

  function registerChatContainer(refEl) {
    chatContainerRef.value = refEl
  }

  function _scrollToBottom() {
    if (!chatContainerRef.value) return
    try {
      const el = chatContainerRef.value
      el.scrollTop = el.scrollHeight
    } catch (e) {}
  }

  // end chat locally (no server API provided): close socket and clear current session
  function endChat(sessionId) {
    if (currentSessionId.value === sessionId) currentSessionId.value = null
    // optionally remove messages and session from local state
    // messages[sessionId] = { records: [], total: 0, pageNum: 1 }
    // keep sessions but mark as ended (no server state available)
    closeSocket()
  }

  const totalUnread = computed(() => sessions.value.reduce((sum, s) => sum + (s.unreadCount || 0), 0))

  // boot helper to load sessions and start WS
  async function boot() {
    await loadSessions()
    initSocket()
  }

  return {
    sessions,
    messages,
    currentSessionId,
    wsState,
    socket,
    chatContainerRef,

    loadSessions,
    loadMessages,
    createSession,
    openSession,
    clearUnread,
    sendMessage,
    initSocket,
    closeSocket,
    registerChatContainer,
    endChat,
    totalUnread,
    boot
  }
})
