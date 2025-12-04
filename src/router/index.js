import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Lawyers from '../views/Lawyers.vue'
import Profile from '../views/Profile.vue'
import Knowledge from '../views/Knowledge.vue'
import Auth from '../views/Auth.vue'
import LawyerWorkbench from '../views/LawyerWorkbench.vue'
import Admin from '../views/Admin.vue'
import Chat from '../views/Chat.vue'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/lawyers',
    name: 'Lawyers',
    component: Lawyers
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: Knowledge
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth
  },
  {
    path: '/lawyer',
    name: 'LawyerWorkbench',
    component: LawyerWorkbench
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const whiteList = ['Auth']

router.beforeEach(async (to) => {
  const userStore = useUserStore()
  const hasToken = !!userStore.token

  if (hasToken) {
    if (!userStore.userInfo) {
      const storedId = localStorage.getItem('userId')
      if (storedId) {
        try {
          await userStore.fetchUserInfo(storedId)
        } catch (error) {
          console.error('自动获取用户信息失败', error)
          userStore.logout()
          return {
            name: 'Auth',
            query: { redirect: to.fullPath }
          }
        }
      }
    }
    if (to.name === 'Auth') {
      const rawRedirect = typeof to.query.redirect === 'string' ? to.query.redirect : undefined
      let redirectTarget = rawRedirect

      if (userStore.userInfo?.role === 'lawyer') {
        if (!redirectTarget || redirectTarget === '/' || redirectTarget === '/lawyers' || redirectTarget === '/profile') {
          redirectTarget = '/lawyer'
        }
      } else if (userStore.userInfo?.role === 'admin') {
        if (!redirectTarget || redirectTarget === '/' || redirectTarget === '/lawyers' || redirectTarget === '/profile') {
          redirectTarget = '/admin'
        }
      }

      if (!redirectTarget) {
        redirectTarget = '/'
      }

      return { path: redirectTarget }
    }
    return true
  }

  if (whiteList.includes((to.name && to.name.toString()) || '')) {
    return true
  }

  return {
    name: 'Auth',
    query: { redirect: to.fullPath }
  }
})

export default router

