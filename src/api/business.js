import request from '../axios/index'

// 新建业务
export function createBusiness(param) {
  return request({
    url: '/business/create',
    method: 'post',
    data: param,
  })
}

// 更新业务
export function updateBusiness(param) {
  return request({
    url: '/business/update',
    method: 'put',
    data: param,
  })
}

// 删除业务
export function deleteBusiness(param) {
  return request({
    url: '/business/delete',
    method: 'delete',
    data: param,
  })
}

// 查询业务列表
export function queryBusinessList(param) {
  return request({
    url: '/business/list',
    method: 'get',
    params: param,
  })
}

// 查询业务信息
export function queryBusinessInfo(param) {
  return request({
    url: '/business/info',
    method: 'get',
    params: param,
  })
}

// 导出业务数据（如需要）
export function businessExport(param) {
  return request({
    url: '/business/export',
    method: 'get',
    responseType: 'blob',
    params: param,
  })
}
