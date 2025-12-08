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

// 上传律师执业证
export function uploadLawyerLicense(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/lawyer/license/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取律师评价列表
export function getLawyerEvaluations(lawyerId, params = {}) {
  return request({
    url: `/evaluation/list/${lawyerId}`,
    method: 'get',
    params
  })
}

// 提交律师资质认证
export function submitLawyerLicense(data) {
  return request({
    url: '/lawyer/license/submit',
    method: 'post',
    data
  })
}

