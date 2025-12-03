<template>
  <div class="bg-gray-100 font-sans min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 z-0">
      <div class="absolute inset-0 bg-brand-800 opacity-90"></div>
      <div
        class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center mix-blend-overlay opacity-30"
      ></div>
      <div class="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
    </div>

    <div
      class="relative z-10 w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[640px]"
    >
      <!-- Visual Panel -->
      <div class="hidden md:flex md:w-1/2 bg-gray-50 relative flex-col justify-between p-12 text-white overflow-hidden">
        <div class="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80"
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-800/80 to-transparent"></div>
        </div>

        <div class="relative z-10">
          <div class="flex items-center space-x-2">
            <i class="fa-solid fa-scale-balanced text-3xl text-brand-500"></i>
            <span class="text-2xl font-bold tracking-wide">法信 LawChat</span>
          </div>
        </div>

        <div class="relative z-10 space-y-6">
          <div v-if="currentRole !== 'admin'">
            <h2 class="text-3xl font-bold mb-4 leading-tight" v-html="heroContent.title"></h2>
            <p class="text-blue-100 text-lg">{{ heroContent.description }}</p>
          </div>
          <div v-else>
            <h2 class="text-3xl font-bold mb-4">系统管理中心</h2>
            <p class="text-blue-100 text-lg">高效管理平台资源，审核入驻申请，维护社区秩序与知识库内容。</p>
          </div>
        </div>

        <div class="relative z-10 text-sm text-blue-200">
          &copy; 2023 法信平台 版权所有
        </div>
      </div>

      <!-- Form Panel -->
      <div class="w-full md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center relative">
        <transition name="fade">
          <div
            v-if="toast.show"
            :class="[
              'absolute top-4 left-1/2 transform -translate-x-1/2 text-white px-6 py-3 rounded-lg shadow-lg flex items-center text-sm',
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            ]"
          >
            <i
              :class="[
                'mr-2',
                toast.type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'
              ]"
            ></i>
            <span>{{ toast.message }}</span>
          </div>
        </transition>

        <!-- Role Switch -->
        <div class="flex justify-center mb-8" v-if="currentRole !== 'admin'">
          <div class="bg-gray-100 p-1 rounded-full flex relative w-full max-w-xs">
            <div
              class="absolute left-1 top-1 w-[calc(50%-8px)] h-[calc(100%-8px)] bg-white rounded-full shadow-sm transition-all duration-300"
              :style="{ transform: currentRole === 'lawyer' ? 'translateX(100%)' : 'translateX(0)' }"
            ></div>
            <button
              class="relative z-10 flex-1 px-6 py-2 text-sm font-medium rounded-full transition-colors duration-300"
              :class="currentRole === 'user' ? 'text-brand-600' : 'text-gray-500'"
              @click="switchRole('user')"
            >
              普通用户
            </button>
            <button
              class="relative z-10 flex-1 px-6 py-2 text-sm font-medium rounded-full transition-colors duration-300"
              :class="currentRole === 'lawyer' ? 'text-brand-600' : 'text-gray-500'"
              @click="switchRole('lawyer')"
            >
              我是律师
            </button>
          </div>
        </div>

        <div class="w-full max-w-sm mx-auto">
          <div class="text-center mb-8">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ panelTitle }}</h3>
            <p class="text-gray-500 text-sm">{{ panelSubtitle }}</p>
          </div>

          <!-- Login -->
          <form v-if="currentMode === 'login'" class="space-y-4" @submit.prevent="handleLogin">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="fa-solid fa-mobile-screen"></i>
                </span>
                <input
                  v-model.trim="loginForm.account"
                  type="text"
                  class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                  placeholder="请输入用户名"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="fa-solid fa-lock"></i>
                </span>
                <input
                  v-model="loginForm.password"
                  type="password"
                  class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                  placeholder="请输入密码"
                />
              </div>
            </div>

            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center checkbox-wrapper cursor-pointer">
                <input type="checkbox" class="hidden" v-model="rememberMe">
                <div class="w-4 h-4 border border-gray-300 rounded mr-2 flex items-center justify-center transition-colors">
                  <svg
                    class="w-3 h-3 text-white pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    v-show="rememberMe"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span class="text-gray-600">记住我</span>
              </label>
              <span class="text-gray-400">忘记密码?</span>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-brand-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-brand-700 hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {{ loading ? '登录中...' : '立即登录' }}
            </button>
          </form>

          <!-- Register -->
          <form v-else class="space-y-4" @submit.prevent="handleRegister">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">手机号码</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="fa-solid fa-mobile-screen"></i>
                </span>
                <input
                  v-model.trim="registerForm.phone"
                  type="text"
                  class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                  placeholder="请输入手机号"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">账号名称</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="fa-solid fa-user"></i>
                </span>
                <input
                  v-model.trim="registerForm.userName"
                  type="text"
                  class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                  placeholder="请输入账号名"
                />
              </div>
            </div>

            <div v-if="currentRole === 'user'">
              <label class="block text-sm font-medium text-gray-700 mb-1">昵称（可选）</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="fa-solid fa-user-pen"></i>
                </span>
                <input
                  v-model.trim="registerForm.nickname"
                  type="text"
                  class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                  placeholder="展示给律师的昵称"
                />
              </div>
            </div>

            <div v-if="currentRole === 'lawyer'">
              <label class="block text-sm font-medium text-gray-700 mb-1">真实姓名</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="fa-solid fa-id-card"></i>
                </span>
                <input
                  v-model.trim="registerForm.lawyerName"
                  type="text"
                  class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                  placeholder="请填写身份证姓名"
                />
              </div>
            </div>

            <div v-if="currentRole === 'lawyer'">
              <label class="block text-sm font-medium text-gray-700 mb-1">所在律所</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="fa-solid fa-building-columns"></i>
                </span>
                <input
                  v-model.trim="registerForm.lawFirm"
                  type="text"
                  class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                  placeholder="请输入律所名称"
                />
              </div>
            </div>

            <div v-if="currentRole === 'lawyer'" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">执业年限</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <i class="fa-solid fa-calendar"></i>
                  </span>
                  <input
                    v-model.number="registerForm.years"
                    type="number"
                    min="0"
                    class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                    placeholder="例如 5"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">擅长领域</label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <i class="fa-solid fa-gavel"></i>
                  </span>
                  <input
                    v-model.trim="registerForm.specialty"
                    type="text"
                    class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                    placeholder="多个领域用逗号隔开"
                  />
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">设置密码</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="fa-solid fa-lock"></i>
                </span>
                <input
                  v-model="registerForm.password"
                  type="password"
                  class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                  placeholder="6-20位字符"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <i class="fa-solid fa-lock"></i>
                </span>
                <input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                  placeholder="请再次输入密码"
                />
              </div>
            </div>

            <div class="flex items-start text-sm mt-2 text-gray-500">
              <div class="w-4 h-4 border border-gray-300 rounded mr-2 flex items-center justify-center bg-brand-600 text-white text-xs">
                ✓
              </div>
              <span>注册即表示您同意 <span class="text-brand-600">《用户服务协议》</span> 和 <span class="text-brand-600">《隐私政策》</span></span>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-brand-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-brand-700 hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {{ loading ? '提交中...' : '立即注册' }}
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-gray-500 text-sm" v-if="currentMode === 'login'">
              还没有账号?
              <button class="text-brand-600 font-bold hover:underline" @click="toggleMode('register')">立即注册</button>
            </p>
            <p class="text-gray-500 text-sm" v-else>
              已有账号?
              <button class="text-brand-600 font-bold hover:underline" @click="toggleMode('login')">去登录</button>
            </p>
          </div>

          <div class="mt-8 pt-6 border-t border-gray-100 text-center">
            <button
              v-if="currentRole !== 'admin'"
              class="text-xs text-gray-400 hover:text-brand-600 transition flex items-center justify-center mx-auto"
              @click="switchToAdmin"
            >
              <i class="fa-solid fa-user-gear mr-1"></i> 管理员登录入口
            </button>
            <button
              v-else
              class="text-xs text-gray-400 hover:text-brand-600 transition flex items-center justify-center mx-auto"
              @click="switchRole('user')"
            >
              <i class="fa-solid fa-arrow-left mr-1"></i> 返回用户登录
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { lawyerRegister } from '@/api/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const currentRole = ref('user') // user | lawyer | admin
const currentMode = ref('login') // login | register
const rememberMe = ref(true)
const loading = ref(false)
const toast = reactive({
  show: false,
  type: 'success',
  message: ''
})

const loginForm = reactive({
  account: '',
  password: ''
})

const registerForm = reactive({
  phone: '',
  userName: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  lawyerName: '',
  lawFirm: '',
  years: '',
  specialty: ''
})

const heroContent = computed(() => {
  if (currentRole.value === 'lawyer') {
    return {
      title: '赋能法律人<br>高效执业',
      description: '加入法信平台，获取精准案源，使用智能办案工具，打造您的专业个人品牌。'
    }
  }
  return {
    title: '让法律服务<br>触手可及',
    description: '连接 10,000+ 专业律师，AI 智能助手 24 小时在线，为您提供高效、可信赖的法律解决方案。'
  }
})

const panelTitle = computed(() => {
  if (currentRole.value === 'admin') return '管理员登录'
  if (currentMode.value === 'register') {
    return currentRole.value === 'lawyer' ? '律师入驻' : '创建账号'
  }
  return currentRole.value === 'lawyer' ? '律师登录' : '欢迎回来'
})

const panelSubtitle = computed(() => {
  if (currentRole.value === 'admin') return '请输入管理权限账号'
  if (currentMode.value === 'register') return '填写以下信息开启您的法律之旅'
  return '请输入您的账号信息进行登录'
})

const notify = (message, type = 'error') => {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3000)
}

const switchRole = (role) => {
  if (currentRole.value === role) return
  currentRole.value = role
  if (role === 'admin') {
    currentMode.value = 'login'
  }
}

const switchToAdmin = () => {
  currentRole.value = 'admin'
  currentMode.value = 'login'
}

const toggleMode = (mode) => {
  if (currentMode.value === mode) return
  currentMode.value = mode
}

const handleLogin = async () => {
  if (!loginForm.account || !loginForm.password) {
    notify('请输入账号和密码')
    return
  }

  loading.value = true
  try {
    await userStore.loginUser({
      userName: loginForm.account,
      password: loginForm.password,
      role: currentRole.value
    })
    notify('登录成功，即将进入系统', 'success')
    setTimeout(() => {
      const rawRedirect = typeof route.query.redirect === 'string' ? route.query.redirect : undefined
      let redirect = rawRedirect

      if (currentRole.value === 'lawyer') {
        // 律师登录优先进入律师工作台，除非显式指定了律师端路由
        if (!redirect || redirect === '/' || redirect === '/lawyers' || redirect === '/profile') {
          redirect = '/lawyer'
        }
      } else if (currentRole.value === 'admin') {
        if (!redirect || redirect === '/' || redirect === '/lawyers' || redirect === '/profile') {
          redirect = '/admin'
        }
      }

      if (!redirect) {
        redirect = '/'
      }

      router.push(redirect)
    }, 800)
  } catch (error) {
    notify(error?.message || '登录失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  if (!registerForm.phone || !registerForm.password || !registerForm.userName) {
    notify('请完整填写注册信息')
    return
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    notify('两次输入的密码不一致')
    return
  }

  loading.value = true
  try {
    if (currentRole.value === 'lawyer') {
      if (!registerForm.lawyerName || !registerForm.lawFirm) {
        notify('请补充律师真实姓名和律所信息')
        loading.value = false
        return
      }
      const payload = {
        userName: registerForm.userName,
        password: registerForm.password,
        phone: registerForm.phone,
        name: registerForm.lawyerName,
        lawFirm: registerForm.lawFirm,
        years: registerForm.years ? Number(registerForm.years) : undefined,
        specialty: registerForm.specialty
          ? registerForm.specialty.split(',').map((item) => item.trim()).filter(Boolean)
          : undefined
      }
      await lawyerRegister(payload)
    } else {
      await userStore.registerUser({
        userName: registerForm.userName,
        password: registerForm.password,
        phone: registerForm.phone,
        nickname: registerForm.nickname || registerForm.userName
      })
    }
    notify('注册成功，请登录', 'success')
    setTimeout(() => {
      currentMode.value = 'login'
    }, 800)
  } catch (error) {
    notify(error?.message || '注册失败，请稍后再试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

