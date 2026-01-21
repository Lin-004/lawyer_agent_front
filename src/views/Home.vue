<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    <!-- 菜单备用显示 -->
    <div class="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16 items-center">
          <div class="flex items-center cursor-pointer" @click="$router.push('/')">
            <i class="fa-solid fa-scale-balanced text-brand-700 text-2xl mr-2"></i>
            <span class="font-bold text-xl text-slate-900 tracking-tight">法律咨询平台</span>
          </div>
          <div class="hidden md:flex space-x-8">
            <button 
              @click="$router.push({name: 'Home'})" 
              class="text-brand-700 border-b-2 border-brand-700 px-1 py-4 transition-colors"
            >
              首页
            </button>
            <button 
              @click="$router.push({name: 'Lawyers'})" 
              class="text-gray-600 hover:text-brand-700 px-1 py-4 transition-colors"
            >
              找律师
            </button>
            <button 
              @click="$router.push({name: 'Knowledge'})" 
              class="text-gray-600 hover:text-brand-700 px-1 py-4 transition-colors"
            >
              法律文库
            </button>
            <button 
              @click="$router.push({name: 'Profile'})" 
              class="text-gray-600 hover:text-brand-700 px-1 py-4 transition-colors"
            >
              个人中心
            </button>
          </div>
          <div class="hidden md:flex items-center space-x-4">
            <button class="text-gray-500 hover:text-brand-600">
              <i class="fa-regular fa-bell text-lg"></i>
            </button>
            <div 
              v-if="isLoggedIn"
              class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded-full pr-3 transition"
              @click="$router.push({name: 'Profile'})"
            >
              <img 
                :src="userAvatar" 
                class="h-8 w-8 rounded-full border border-gray-200" 
                alt="User Avatar"
              >
              <span class="text-sm font-medium text-gray-700">{{ userName }}</span>
            </div>
            <button 
              v-else
              class="px-4 py-2 bg-brand-600 text-white text-sm rounded-full hover:bg-brand-700 transition"
              @click="$router.push({name: 'Auth'})"
            >
              登录 / 注册
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="pt-0">
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
          <router-link to="/lawyers" class="text-brand-600 hover:underline text-sm">
            查看全部 >
    </router-link>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            v-for="category in categories" 
            :key="category.id"
            @click="goToCategory(category)"
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

const userName = computed(() => userStore.userInfo?.nickname || '游客')
const isLoggedIn = computed(() => userStore.isLoggedIn)

const categories = [
  { id: 1, title: '刑事辩护', description: '刑事案件代理与辩护', icon: 'fa-solid fa-user-shield', bgColor: 'bg-emerald-50 text-emerald-600', hoverColor: 'group-hover:bg-emerald-600' },
  { id: 2, title: '民事诉讼', description: '各类民事纠纷代理', icon: 'fa-solid fa-gavel', bgColor: 'bg-blue-50 text-blue-600', hoverColor: 'group-hover:bg-blue-600' },
  { id: 3, title: '合同纠纷', description: '合同起草与纠纷解决', icon: 'fa-solid fa-file-contract', bgColor: 'bg-indigo-50 text-indigo-600', hoverColor: 'group-hover:bg-indigo-600' },
  { id: 4, title: '婚姻家事', description: '离婚、抚养、财产分割', icon: 'fa-solid fa-rings-wedding', bgColor: 'bg-pink-50 text-pink-600', hoverColor: 'group-hover:bg-pink-600' },
  { id: 5, title: '劳动纠纷', description: '劳动争议与工伤赔偿', icon: 'fa-solid fa-briefcase', bgColor: 'bg-amber-50 text-amber-600', hoverColor: 'group-hover:bg-amber-600' },
  { id: 6, title: '公司法律', description: '公司合规、合同与治理', icon: 'fa-solid fa-building', bgColor: 'bg-slate-50 text-slate-600', hoverColor: 'group-hover:bg-slate-600' },
  { id: 7, title: '交通事故', description: '交通事故责任与理赔', icon: 'fa-solid fa-car-crash', bgColor: 'bg-rose-50 text-rose-600', hoverColor: 'group-hover:bg-rose-600' },
  { id: 8, title: '房产纠纷', description: '房屋买卖、租赁纠纷', icon: 'fa-solid fa-house', bgColor: 'bg-violet-50 text-violet-600', hoverColor: 'group-hover:bg-violet-600' },
  { id: 9, title: '知识产权', description: '著作权、商标、专利事务', icon: 'fa-solid fa-lightbulb', bgColor: 'bg-yellow-50 text-yellow-600', hoverColor: 'group-hover:bg-yellow-600' },
  { id: 10, title: '涉外案件', description: '涉外法律事务和争议', icon: 'fa-solid fa-globe', bgColor: 'bg-cyan-50 text-cyan-600', hoverColor: 'group-hover:bg-cyan-600' },
  { id: 11, title: '行政诉讼', description: '行政复议与行政诉讼', icon: 'fa-solid fa-scale-unbalanced', bgColor: 'bg-emerald-50 text-emerald-600', hoverColor: 'group-hover:bg-emerald-600' },
  { id: 12, title: '继承纠纷', description: '遗产继承与分割', icon: 'fa-solid fa-family', bgColor: 'bg-fuchsia-50 text-fuchsia-600', hoverColor: 'group-hover:bg-fuchsia-600' },
  { id: 13, title: '股权纠纷', description: '股东权益与股权争议', icon: 'fa-solid fa-chart-line', bgColor: 'bg-lime-50 text-lime-600', hoverColor: 'group-hover:bg-lime-600' },
  { id: 14, title: '工伤赔偿', description: '工伤认定与赔偿维权', icon: 'fa-solid fa-hospital-user', bgColor: 'bg-amber-50 text-amber-600', hoverColor: 'group-hover:bg-amber-600' },
  { id: 15, title: '专利侵权', description: '专利维权与案件代理', icon: 'fa-solid fa-box-open', bgColor: 'bg-zinc-50 text-zinc-600', hoverColor: 'group-hover:bg-zinc-600' }
]

const goToCategory = (category) => {
  router.push({ name: 'Lawyers', query: { specialty: category.title } })
}

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

