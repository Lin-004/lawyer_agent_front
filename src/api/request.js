import axios from 'axios'

const service = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    // 若无统一的 code/success 字段，默认视为成功
    if (res?.code === undefined && res?.success === undefined) {
      return res
    }

    if (res.code === '00000' || res.success) {
      return res
    }

    console.error('接口错误:', res.message)
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  error => {
    console.error('响应错误:', error)
    return Promise.reject(error)
  }
)

export default service

