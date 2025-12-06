import request from './request'

// 新增律师可预约时间段
export function addSchedule(data) {
  return request({
    url: '/lawyer/schedule/add',
    method: 'post',
    data
  })
}

// 获取律师可预约时间段列表
export function getScheduleList(params) {
  return request({
    url: '/lawyer/schedule/list',
    method: 'get',
    params
  })
}

// 更新律师可预约时间段
export function updateSchedule(data) {
  return request({
    url: '/lawyer/schedule/update',
    method: 'put',
    data
  })
}
