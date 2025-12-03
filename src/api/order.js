import request from './request'

// 用户查看订单
export function getUserOrders(params) {
  return request({
    url: '/orders/user',
    method: 'get',
    params
  })
}

// 律师查看订单
export function getLawyerOrders(params) {
  return request({
    url: '/orders/lawyer',
    method: 'get',
    params
  })
}

// 取消订单（用户 / 律师都可以调用）
export function cancelOrder(orderId) {
  return request({
    url: '/orders/cancel',
    method: 'put',
    params: { orderId }
  })
}

