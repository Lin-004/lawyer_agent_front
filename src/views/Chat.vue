<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    <div class="pt-16">
      <div class="max-w-4xl mx-auto px-4 py-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 border-b flex items-center justify-between">
            <div class="flex items-center gap-4">
              <img :src="lawyer.avatar || defaultAvatar" class="w-12 h-12 rounded-full bg-gray-100" />
              <div>
                <div class="font-bold">{{ lawyer.name || '律师' }}</div>
                <div class="text-sm text-gray-500">{{ lawyer.lawFirm || '' }}</div>
              </div>
            </div>
            <div class="text-sm text-gray-500">在线咨询</div>
          </div>

          <div class="h-96 overflow-y-auto p-4" ref="msgContainer">
            <div v-for="(m, idx) in messages" :key="idx" class="mb-4">
              <div v-if="m.from === 'user'" class="flex justify-end">
                <div class="bg-brand-600 text-white px-3 py-2 rounded-lg max-w-[70%]">{{ m.content }}</div>
              </div>
              <div v-else class="flex">
                <div class="bg-gray-100 px-3 py-2 rounded-lg max-w-[70%]">{{ m.content }}</div>
              </div>
            </div>
          </div>

          <div class="p-4 border-t bg-white">
            <div class="flex gap-2">
              <input v-model="input" @keyup.enter="onSend" placeholder="输入消息，按回车发送" class="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <button @click="onSend" class="bg-brand-600 text-white px-4 py-2 rounded-lg">发送</button>
            </div>
            <p class="text-xs text-gray-400 mt-2">发送消息后，律师将会收到并可回复（需后端支持即时推送或轮询）。</p>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import { getLawyerDetail } from '@/api/lawyer'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const lawyerId = route.query.lawyerId || route.query.id

const lawyer = ref({})
const input = ref('')
const msgContainer = ref(null)
const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=User123'
const currentSessionId = ref(null)

// Pinia chat store (负责 websocket、会话、消息、未读等)
const chatStore = useChatStore()

// 计算当前会话消息数组（映射为 Chat.vue 期望的简单结构）
const messages = computed(() => {
  const sid = currentSessionId.value
  if (!sid) return []
  const page = chatStore.messages[sid]
  if (!page || !Array.isArray(page.records)) return []
  // 将后端记录映射成 { from: 'user'|'lawyer', content }
  const userStore = useUserStore()
  return page.records.map(m => {
    // 判断消息来源：如果 senderId 是当前用户ID，则为 'user'，否则为 'lawyer'
    const from = m.senderId === userStore.userId ? 'user' : 'lawyer'
    return { from, content: m.content || m.message || m.text || '' }
  })
})

const scrollToBottom = () => {
  nextTick(() => {
    if (msgContainer.value) {
      msgContainer.value.scrollTop = msgContainer.value.scrollHeight
    }
  })
}

const loadLawyer = async () => {
  if (!lawyerId) return
  try {
    const res = await getLawyerDetail(lawyerId)
    if (res) lawyer.value = res
  } catch (e) {
    console.error('加载律师信息失败', e)
  }
}

const ensureSessionAndOpen = async () => {
  // 创建或获取会话 ID（createSession 映射到 /consult/session/create）
  try {
    const sid = await chatStore.createSession(lawyerId)
    currentSessionId.value = sid
    if (sid) {
      await chatStore.openSession(sid)
    } else {
      // 没拿到 sessionId，尝试从已有会话中查找
      await chatStore.loadSessions()
      const existing = chatStore.sessions.find(s => s.targetId == lawyerId)
      if (existing) {
        currentSessionId.value = existing.sessionId
        await chatStore.openSession(existing.sessionId)
      }
    }
  } catch (e) {
    console.warn('初始化会话失败', e)
  }
}

const onSend = async () => {
  const text = input.value && input.value.trim()
  if (!text || !currentSessionId.value) return

  // 通过 store 发送（store 会走 websocket 并做乐观更新）
  const ok = chatStore.sendMessage({ sessionId: currentSessionId.value, receiverId: lawyerId, content: text, type: 'text' })
  if (!ok) {
    console.warn('消息未通过 WebSocket 发送（socket 未就绪）')
  }

  // 清空输入并滚动
  input.value = ''
  scrollToBottom()
}

onMounted(async () => {
  await loadLawyer()
  // 启动 store（加载会话并打开 websocket）
  await chatStore.boot()

  // 确保当前 sessionId 并打开会话（load messages）
  await ensureSessionAndOpen()

  // 将消息容器注册给 store（用于自动滚动）
  nextTick(() => {
    if (msgContainer.value) chatStore.registerChatContainer(msgContainer.value)
  })
})

onUnmounted(() => {
  // 视需求可关闭 socket（此处保持 socket 以便后台推送）
  // chatStore.closeSocket()
})
</script>
