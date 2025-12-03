import request from './request'

// 管理后台登录
export function adminLogin(data) {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  })
}

// 管理后台用户/律师列表
export function getAdminUserList(params) {
  return request({
    url: '/admin/list',
    method: 'get',
    params
  })
}

// 律师执业证分页列表
export function getLawyerLicenseList(params) {
  return request({
    url: '/admin/lawyer/license/list',
    method: 'get',
    params
  })
}

// 审核通过
export function approveLawyerLicense(id) {
  return request({
    url: `/admin/lawyer/license/${id}/approve`,
    method: 'post'
  })
}

// 审核拒绝
export function rejectLawyerLicense(id, remark) {
  return request({
    url: `/admin/lawyer/license/${id}/reject`,
    method: 'post',
    params: { remark }
  })
}

