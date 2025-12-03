import request from './request'

// 用户登录
export function login(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

// 用户注册
export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

// 律师注册
export function lawyerRegister(data) {
  return request({
    url: '/lawyer/register',
    method: 'post',
    data
  })
}

// 获取用户信息
export function getUserInfo(id) {
  return request({
    url: `/user/${id}`,
    method: 'get'
  })
}

