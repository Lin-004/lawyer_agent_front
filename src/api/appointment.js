import request from './request'

// 创建预约（用户端）
export function createAppointment(data) {
  return request({
    url: '/appointment/create',
    method: 'post',
    data
  })
}

// 查看预约记录（用户端）
export function getAppointmentList(params) {
  return request({
    url: '/appointment/list',
    method: 'get',
    params
  })
}

// 律师查看预约记录
export function getLawyerAppointmentList(params) {
  return request({
    url: '/lawyer/appointment/list',
    method: 'get',
    params
  })
}

// 律师接受预约并生成订单
export function acceptAppointment(data) {
  return request({
    url: '/lawyer/appointment/accept',
    method: 'post',
    data
  })
}

// 律师拒绝预约
export function rejectAppointment(data) {
  return request({
    url: '/lawyer/appointment/reject',
    method: 'post',
    data
  })
}

