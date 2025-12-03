import request from './request'

// 获取律师列表
export function getLawyerList(params) {
  return request({
    url: '/lawyer/list',
    method: 'get',
    params
  })
}

// 获取律师详情
export function getLawyerDetail(id) {
  return request({
    url: `/lawyer/${id}`,
    method: 'get'
  })
}

// 获取所有专业领域
export function getSpecialties() {
  return request({
    url: '/lawyer/specialties',
    method: 'get'
  })
}

// 获取律师可预约时间段
export function getLawyerSchedule(params) {
  return request({
    url: '/lawyer/schedule/list',
    method: 'get',
    params
  })
}

