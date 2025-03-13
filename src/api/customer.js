import request from '../axios/index'
//已完成
// 新建客户
export function createCustomer(param) {
    return request({
		url: '/customer/create',
		method: 'post',
		data: param,
	})
}
//已完成
// 更新客户
export function updateCustomer(param) {
    return request({
		url: '/customer/update',
		method: 'put',
		data: param,
	})
}

// 发送邮件给客户
export function sendMailToCustomer(param) {
    return request({
		url: '/customer/send',
		method: 'post',
		data: param,
	})
}
//已完成
// 删除客户
export function deleteCustomer(param) {
    return request({
		url: '/customer/delete',
		method: 'delete',
		data: param,
	})
}
//已完成
// 查询客户列表
export function queryCustomerList(param) {
    return request({
		url: '/customer/list',
		method: 'get',
		params: param,
	})
}

//查询所有客户id
export function queryAllCustomerIdsAndNames(){
	return request({
		url: '/customer/all',
		method: 'get',
	})
}
//已完成
// 查询客户信息
export function queryCustomerInfo(param) {
    return request({
		url: '/customer/info',
		method: 'get',
		params: param,
	})
}
//已弃用
// 查询客户信息
export function queryCustomerOption(param) {
    return request({
		url: '/customer/option',
		method: 'get',
		params: param,
	})
}
//完成
// 导出Excel表格
export function customerExport(param) {
    return request({
        url: '/customer/export',
        method: 'get',
        params: param,
    })
}