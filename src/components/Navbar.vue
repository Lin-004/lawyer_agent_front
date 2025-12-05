<template>
  <nav v-if="!isLawyerRoute" class="fixed w-full z-50 glass-effect border-b border-gray-100 shadow-sm transition-all duration-300" id="navbar">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <div class="flex items-center cursor-pointer" @click="$router.push('/')">
          <i class="fa-solid fa-scale-balanced text-brand-700 text-2xl mr-2"></i>
          <span class="font-bold text-xl text-slate-900 tracking-tight">法信 LawChat</span>
        </div>
        
        <!-- Desktop Menu -->
        <div class="hidden md:flex space-x-8">
          <button 
            @click="navigate('Home')" 
            :class="['text-gray-600 hover:text-brand-700 px-1 py-4 transition-colors', 
                     $route.name === 'Home' ? 'active-nav' : '']"
          >
            首页
          </button>
          <button 
            @click="navigate('Lawyers')" 
            :class="['text-gray-600 hover:text-brand-700 px-1 py-4 transition-colors', 
                     $route.name === 'Lawyers' ? 'active-nav' : '']"
          >
            找律师
          </button>
          <button 
            @click="navigate('Knowledge')" 
            :class="['text-gray-600 hover:text-brand-700 px-1 py-4 transition-colors', 
                     $route.name === 'Knowledge' ? 'active-nav' : '']"
          >
            法律文库
          </button>
          <button 
            @click="navigate('Profile')" 
            :class="['text-gray-600 hover:text-brand-700 px-1 py-4 transition-colors', 
                     $route.name === 'Profile' ? 'active-nav' : '']"
          >
            个人中心
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden flex items-center">
          <button class="text-gray-600 hover:text-brand-700 focus:outline-none" @click="toggleMobileMenu">
            <i class="fa-solid fa-bars text-xl"></i>
          </button>
        </div>

        <!-- User Profile Widget -->
        <div class="hidden md:flex items-center space-x-4">
          <button class="text-gray-500 hover:text-brand-600">
            <i class="fa-regular fa-bell text-lg"></i>
          </button>
          <div 
            v-if="isLoggedIn"
            class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded-full pr-3 transition"
            @click="navigate('Profile')"
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
            @click="navigate('Auth')"
          >
            登录 / 注册
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 如果是律师端路径（以 /lawyer 开头），则隐藏此导航
const isLawyerRoute = computed(() => {
  try {
    return route.path && route.path.startsWith('/lawyer')
  } catch (e) {
    return false
  }
})

const userName = computed(() => userStore.userInfo?.nickname || '游客')
const userAvatar = computed(() => 
  userStore.userInfo?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User123'
)
const isLoggedIn = computed(() => userStore.isLoggedIn)

const navigate = (name) => {
  router.push({ name })
}

const toggleMobileMenu = () => {
  // 移动端菜单逻辑
  console.log('Toggle mobile menu')
}
</script>

