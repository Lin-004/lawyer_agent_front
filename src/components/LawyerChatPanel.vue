<template>
  <div class="h-[calc(80vh-4rem)] w-full flex rounded-xl shadow-sm border border-gray-200 overflow-hidden bg-white">
    <!-- 会话列表 -->
    <div class="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      <div class="h-16 px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-lg font-bold">咨询会话</h2>
        <span v-if="totalUnread > 0" class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          {{ totalUnread }}
        </span>
      </div>

      <!-- 会话过滤 -->
      <div class="px-4 py-3 border-b border-gray-100">
        <div class="flex gap-2">
          <button
            v-for="status in ['all', 'unread']"
            :key="status"
            @click="filterStatus = status"
            :class="[
              'px-3 py-1 text-sm rounded transition',
              filterStatus === status
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            ]"
          >
            {{ status === 'all' ? '全部' : '未读' }}
          </button>
        </div>
      </div>

      <!-- 会话列表滚动区 -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="filteredSessions.length === 0" class="p-4 text-center text-gray-400">
          暂无会话
        </div>
        <div
          v-for="session in filteredSessions"
          :key="session.sessionId"
          @click="selectSession(session)"
          :class="[
            'px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition',
            currentSessionId === session.sessionId ? 'bg-blue-50' : ''
          ]"
        >
          <div class="flex items-center gap-3">
            <img
              :src="session.targetAvatar || defaultAvatar"
              class="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <p class="font-medium text-gray-900 truncate">{{ session.targetName }}</p>
                <span v-if="session.unreadCount > 0" class="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full flex-shrink-0">
                  {{ session.unreadCount }}
                </span>
              </div>
              <p class="text-sm text-gray-500 truncate">{{ session.lastMessage }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 聊天主区域 -->
    <div class="flex-1 flex flex-col">
      <div v-if="!currentSessionId" class="flex-1 flex items-center justify-center text-gray-400">
        <div class="text-center">
          <i class="fa-solid fa-comments text-6xl mb-4 opacity-20"></i>
          <p>选择一个会话开始对话</p>
        </div>
      </div>

      <template v-else>
        <!-- 聊天头部 -->
        <div class="h-16 px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div class="flex items-center gap-3">
            <img
              :src="currentSession?.targetAvatar || defaultAvatar"
              class="w-10 h-10 rounded-full bg-gray-100"
            />
            <div>
              <p class="font-bold text-gray-900">{{ currentSession?.targetName }}</p>
              <p class="text-xs text-gray-500">用户咨询</p>
            </div>
          </div>
          <button
            @click="onEndChat"
            class="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
          >
            结束会话
          </button>
        </div>

        <!-- 消息区域 -->
        <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50" ref="msgContainer">
          <div v-if="messages.length === 0" class="text-center text-gray-400 py-8">
            暂无消息，开始对话吧
          </div>
          <div v-for="(m, idx) in messages" :key="idx" class="mb-4">
            <!-- 律师消息 (右侧) - 当发送者是当前律师时 -->
            <div v-if="m.senderId === currentUserId" class="flex justify-end">
              <div class="bg-brand-600 text-white px-4 py-2 rounded-lg max-w-[70%] break-words">
                {{ m.content }}
              </div>
            </div>
            <!-- 用户消息 (左侧) - 当发送者不是当前律师时（用户发送） -->
            <div v-else class="flex justify-start">
              <div class="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg max-w-[70%] break-words">
                {{ m.content }}
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="h-24 px-6 py-4 border-t border-gray-200 bg-white">
          <div class="flex gap-2 h-full">
            <textarea
              v-model="input"
              @keyup.enter.ctrl="onSend"
              placeholder="输入消息，Ctrl+Enter 发送"
              class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            ></textarea>
            <button
              @click="onSend"
              class="px-4 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition font-medium"
            >
              发送
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- 案件笔记已移除（律师端聊天室无需案件笔记） -->
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'

const chatStore = useChatStore()
const userStore = useUserStore()
const msgContainer = ref(null)
const input = ref('')
const currentSessionId = ref(null)
const filterStatus = ref('all')
const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=User123'

const currentUserId = computed(() => userStore.userId)

const currentSession = computed(() => {
  return chatStore.sessions.find(s => s.sessionId === currentSessionId.value)
})

const messages = computed(() => {
  const sid = currentSessionId.value
  if (!sid) return []
  const page = chatStore.messages[sid]
  if (!page || !Array.isArray(page.records)) return []
  return page.records
})

const filteredSessions = computed(() => {
  if (filterStatus.value === 'unread') {
    return chatStore.sessions.filter(s => s.unreadCount > 0)
  }
  return chatStore.sessions
})

const totalUnread = computed(() => chatStore.totalUnread)

const scrollToBottom = () => {
  nextTick(() => {
    if (msgContainer.value) {
      msgContainer.value.scrollTop = msgContainer.value.scrollHeight
    }
  })
}

const selectSession = async (session) => {
  currentSessionId.value = session.sessionId
  await chatStore.clearUnread(session.sessionId)
  await chatStore.loadMessages(session.sessionId, 1)
  nextTick(() => {
    if (msgContainer.value) chatStore.registerChatContainer(msgContainer.value)
    scrollToBottom()
  })
}

const onSend = async () => {
  const text = input.value && input.value.trim()
  if (!text || !currentSessionId.value || !currentSession.value) return
  const ok = chatStore.sendMessage({
    sessionId: currentSessionId.value,
    receiverId: currentSession.value.targetId,
    content: text,
    type: 'text'
  })
  if (!ok) console.warn('消息未通过 WebSocket 发送（socket 未就绪）')
  input.value = ''
  scrollToBottom()
}

const emit = defineEmits(['ended'])

const onEndChat = async () => {
  if (!currentSessionId.value) return
  const confirmed = window.confirm('确定要结束此会话吗？结束后将无法继续对话。')
  if (confirmed) {
    chatStore.endChat(currentSessionId.value)
    currentSessionId.value = null
    emit('ended')
  }
}

if (!chatStore._booted) chatStore.boot()
</script>

<style scoped>
.max-w-7xl { max-width: 1200px; }
</style>
