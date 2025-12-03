<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    <div class="pt-16">
      <!-- Hero Section with Chat -->
      <div class="relative bg-gradient-to-b from-brand-50 to-white pb-12">
        <div class="max-w-4xl mx-auto px-4 pt-12 sm:pt-20">
          <div class="text-center mb-10">
            <h1 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              遇到法律问题？<span class="text-brand-700">AI 帮您初步分析</span>
            </h1>
            <p class="text-gray-500 text-lg">基于最新民法典，24小时即时响应，为您匹配最合适的解决方案。</p>
          </div>

          <!-- Chat Interface -->
          <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <!-- Chat History -->
            <div class="h-80 overflow-y-auto p-6 bg-gray-50/50 no-scrollbar" ref="chatContainer">
              <!-- AI Welcome Message -->
              <div class="flex mb-6" v-if="messages.length === 0">
                <div class="flex-shrink-0 mr-3">
                  <div class="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white">
                    <i class="fa-solid fa-robot text-sm"></i>
                  </div>
                </div>
                <div class="chat-bubble ai shadow-sm bg-white border border-gray-100">
                  你好！我是您的智能法律助手。请告诉我您遇到了什么问题？<br>
                  <span class="text-xs text-gray-400 mt-2 block">例如：房东不退押金怎么办？劳动合同被辞退有赔偿吗？</span>
                </div>
              </div>

              <!-- Messages -->
              <div 
                v-for="(msg, index) in messages" 
                :key="index"
                :class="['flex mb-6', msg.role === 'user' ? 'flex-row-reverse' : '']"
              >
                <div :class="['flex-shrink-0', msg.role === 'user' ? 'ml-3' : 'mr-3']">
                  <img 
                    v-if="msg.role === 'user'"
                    :src="userAvatar" 
                    class="w-8 h-8 rounded-full"
                  >
                  <div 
                    v-else
                    class="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white"
                  >
                    <i class="fa-solid fa-robot text-sm"></i>
                  </div>
                </div>
                <div 
                  :class="[
                    'chat-bubble shadow-sm',
                    msg.role === 'user' ? 'user' : 'ai bg-white border border-gray-100'
                  ]"
                  v-html="formatMessage(msg.content)"
                ></div>
              </div>

              <!-- Loading Indicator -->
              <div v-if="isLoading" class="flex mb-6">
                <div class="flex-shrink-0 mr-3">
                  <div class="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white">
                    <i class="fa-solid fa-robot text-sm"></i>
                  </div>
                </div>
                <div class="chat-bubble ai shadow-sm bg-white border border-gray-100">
                  <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Input Area -->
            <div class="p-4 bg-white border-t border-gray-100">
              <div class="relative flex items-center">
                <input 
                  type="text" 
                  v-model="inputMessage"
                  @keyup.enter="sendMessage"
                  placeholder="输入您的问题..." 
                  class="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition shadow-inner"
                >
                <button 
                  @click="sendMessage"
                  :disabled="isLoading || !inputMessage.trim()"
                  class="absolute right-2 p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i class="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories Grid -->
      <div class="max-w-7xl mx-auto px-4 py-12">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-slate-800">常见法律服务</h2>
          <a href="#" class="text-brand-600 hover:underline text-sm">查看全部 ></a>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            v-for="category in categories" 
            :key="category.id"
            class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition cursor-pointer group"
          >
            <div 
              :class="[
                'w-12 h-12 rounded-lg flex items-center justify-center text-xl mb-4 group-hover:text-white transition',
                category.bgColor,
                category.hoverColor
              ]"
            >
              <i :class="category.icon"></i>
            </div>
            <h3 class="font-bold text-lg mb-1">{{ category.title }}</h3>
            <p class="text-sm text-gray-500">{{ category.description }}</p>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import { sseChat } from '@/api/ai'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const messages = ref([])
const inputMessage = ref('')
const isLoading = ref(false)
const chatContainer = ref(null)
const chatId = ref(`chat_${Date.now()}`)

const userAvatar = computed(() => 
  userStore.userInfo?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User123'
)

const categories = [
  {
    id: 1,
    title: '合同审查',
    description: '租房、劳动、借款合同风险排查',
    icon: 'fa-solid fa-file-contract',
    bgColor: 'bg-blue-50 text-blue-600',
    hoverColor: 'group-hover:bg-blue-600'
  },
  {
    id: 2,
    title: '婚姻家事',
    description: '离婚协议、财产分割、子女抚养',
    icon: 'fa-solid fa-rings-wedding',
    bgColor: 'bg-red-50 text-red-600',
    hoverColor: 'group-hover:bg-red-600'
  },
  {
    id: 3,
    title: '劳动工伤',
    description: '工伤认定、辞退赔偿、欠薪追讨',
    icon: 'fa-solid fa-helmet-safety',
    bgColor: 'bg-amber-50 text-amber-600',
    hoverColor: 'group-hover:bg-amber-600'
  },
  {
    id: 4,
    title: '刑事辩护',
    description: '取保候审、罪轻辩护、法律会见',
    icon: 'fa-solid fa-user-shield',
    bgColor: 'bg-emerald-50 text-emerald-600',
    hoverColor: 'group-hover:bg-emerald-600'
  }
]

const formatMessage = (content) => {
  // 简单的消息格式化，支持换行
  return content.replace(/\n/g, '<br>')
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMsg = inputMessage.value.trim()
  inputMessage.value = ''

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: userMsg
  })

  scrollToBottom()
  isLoading.value = true

  // 添加AI消息占位
  const aiMessageIndex = messages.value.push({
    role: 'assistant',
    content: ''
  }) - 1
  let assistantContent = ''

  const appendAssistantContent = (text) => {
    if (!text) return
    assistantContent += text
    messages.value[aiMessageIndex].content = assistantContent
    scrollToBottom()
  }

  try {
    // 使用SSE流式接收
    const response = await sseChat({
      message: userMsg,
      chatId: chatId.value
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let streamClosed = false

    while (true) {
      const { done, value } = await reader.read()
      if (done || streamClosed) break

      buffer += decoder.decode(value, { stream: true })
      const segments = buffer.split('\n\n')
      buffer = segments.pop() || ''

      for (const segment of segments) {
        const line = segment.trim()
        if (!line) continue
        if (!line.startsWith('data:')) continue

        const data = line.replace(/^data:\s*/, '')
        if (!data) continue
        if (data === '[DONE]') {
          await reader.cancel()
          streamClosed = true
          break
        }

        let chunkText = ''
        try {
          const parsed = JSON.parse(data)
          chunkText =
            parsed?.content ||
            parsed?.message ||
            parsed?.text ||
            parsed?.delta?.content ||
            ''

          if (!chunkText && Array.isArray(parsed?.choices)) {
            chunkText = parsed.choices
              .map((choice) => choice?.delta?.content || choice?.message?.content || '')
              .join('')
          }
        } catch {
          chunkText = data
        }

        if (chunkText) {
          // 去掉可能残留的 "data:" 前缀（多行场景）
          chunkText = chunkText.replace(/^data:\s*/gm, '')
        }

        appendAssistantContent(chunkText)
      }

      if (streamClosed) break
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    if (error?.status === 401) {
      messages.value[aiMessageIndex].content = '登录已过期，请先登录后再试。'
      setTimeout(() => {
        router.push({
          name: 'Auth',
          query: { redirect: router.currentRoute.value.fullPath }
        })
      }, 600)
    } else {
      messages.value[aiMessageIndex].content = '抱歉，服务暂时不可用，请稍后再试。'
    }
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}
</script>

