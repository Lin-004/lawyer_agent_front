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
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import { getLawyerDetail } from '@/api/lawyer'
import { getChatHistory, sendMessage, createChat } from '@/api/chat'

const route = useRoute()
const lawyerId = route.query.lawyerId || route.query.id

const lawyer = ref({})
const messages = ref([])
const input = ref('')
const msgContainer = ref(null)
const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=User123'
let pollTimer = null
let chatId = null

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

const loadHistory = async () => {
  try {
    const params = {}
    if (chatId) params.chatId = chatId
    else if (lawyerId) params.lawyerId = lawyerId
    const res = await getChatHistory(params)
    // 期望后端返回消息数组: [{ from: 'user'|'lawyer', content, createdAt }]
    if (Array.isArray(res)) {
      messages.value = res.map((m) => ({ from: m.from === 'user' ? 'user' : 'lawyer', content: m.content }))
      scrollToBottom()
    } else if (res?.messages) {
      messages.value = res.messages
      scrollToBottom()
    }
  } catch (e) {
    console.error('加载聊天历史失败', e)
  }
}

const onSend = async () => {
  const text = input.value && input.value.trim()
  if (!text) return

  // 添加本地消息
  messages.value.push({ from: 'user', content: text })
  scrollToBottom()

  // 清空输入
  input.value = ''

  try {
    // 确保有 chatId（可选创建）
    if (!chatId) {
      try {
        const c = await createChat({ lawyerId })
        chatId = c?.chatId || c?.id || chatId
      } catch (err) {
        // 如果后端未实现 createChat，也可继续不设置 chatId
        console.warn('createChat 失败或未实现，继续发送消息', err)
      }
    }

    await sendMessage({ toLawyerId: lawyerId, chatId, content: text })
  } catch (e) {
    console.error('发送消息失败', e)
  }
}

onMounted(async () => {
  await loadLawyer()
  await loadHistory()

  // 简单轮询实现：每 3 秒拉取消息（后端推荐使用 websocket 或 SSE）
  pollTimer = setInterval(() => {
    loadHistory()
  }, 3000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>
