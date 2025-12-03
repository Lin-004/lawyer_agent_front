import { defineStore } from 'pinia'
import { login, register, getUserInfo } from '@/api/user'

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'
const USER_ID_KEY = 'userId'

const getInitialUser = () => {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    localStorage.removeItem(USER_INFO_KEY)
    localStorage.removeItem(USER_ID_KEY)
    return null
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: getInitialUser(),
    token: localStorage.getItem(TOKEN_KEY) || null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userId: (state) => state.userInfo?.id
  },

  actions: {
    async loginUser(credentials) {
      try {
        const res = await login(credentials)
        if (!res.success) {
          throw new Error(res.message || '登录失败')
        }

        const payload = res.data
        const token =
          (typeof payload === 'object' && (payload?.token || payload?.accessToken)) ||
          (typeof payload === 'string' ? payload : null) ||
          'mock-token'

        this.token = token
        localStorage.setItem(TOKEN_KEY, token)

        if (payload?.user) {
          this.setUserInfo(payload.user)
        } else if (payload?.userInfo) {
          this.setUserInfo(payload.userInfo)
        } else {
          const targetId = payload?.userId || payload?.id || credentials?.id
          if (targetId) {
            await this.fetchUserInfo(targetId)
          }
        }

        return res
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    },

    async registerUser(userData) {
      try {
        const res = await register(userData)
        if (!res.success) {
          throw new Error(res.message || '注册失败')
        }
        return res
      } catch (error) {
        console.error('注册失败:', error)
        throw error
      }
    },

    async fetchUserInfo(id) {
      try {
        if (!id) return null
        const res = await getUserInfo(id)
        if (res.success) {
          this.setUserInfo(res.data)
        }
        return res
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    },

    setUserInfo(user) {
      this.userInfo = user
      if (user) {
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(user))
        if (user.id) {
          localStorage.setItem(USER_ID_KEY, String(user.id))
        }
      } else {
        localStorage.removeItem(USER_INFO_KEY)
        localStorage.removeItem(USER_ID_KEY)
      }
    },

    logout() {
      this.userInfo = null
      this.token = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_INFO_KEY)
      localStorage.removeItem(USER_ID_KEY)
    }
  }
})

