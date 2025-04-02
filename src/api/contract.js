import request from '../axios/index'

// 获取合同列表
export function queryContractList(param) {
  return request({
    url: '/contract/list',
    method: 'get',
    params: param,
  })
}

// 获取合同详情
export function queryContractInfo(param) {
  return request({
    url: '/contract/info',
    method: 'get',
    params: param,
  })
}

// 创建合同
export function createContract(param) {
  return request({
    url: '/contract/create',
    method: 'post',
    data: param,
  })
}

// 更新合同
export function updateContract(param) {
  return request({
    url: '/contract/update',
    method: 'put',
    data: param,
  })
}

// 删除合同
export function deleteContract(param) {
  return request({
    url: '/contract/delete',
    method: 'delete',
    params: param,
  })
}

// 导出合同数据
export function contractExport(param) {
  return request({
    url: '/contract/export',
    method: 'get',
    params: param,
  })
}

// 更新合同状态（已签/未签）
export function updateContractStatus(param) {
  return request({
    url: '/contract/status',
    method: 'put',
    params: param,
  })
}