import request from '../axios/index'
//完成
// 新建产品
export function createProduct(param) {
    return request({
		url: '/product/create',
		method: 'post',
		data: param,
	})
}
//完成
// 更新产品
export function updateProduct(param) {
    return request({
		url: '/product/update',
		method: 'put',
		data: param,
	})
}
//完成
// 删除产品
export function deleteProduct(param) {
    return request({
		url: '/product/delete',
		method: 'delete',
		data: param,
	})
}
//完成
// 查询产品信息
export function queryProductInfo(param) {
    return request({
		url: '/product/info',
		method: 'get',
		params: param,
	})
}
//完成
// 查询产品列表
export function queryProductList(param) {
    return request({
		url: '/product/list',
		method: 'get',
		params: param,
	})
}
//完成
// 导出Excel表格
export function productExport(param) {
    return request({
		url: '/product/export',
		method: 'get',
		params: param,
	})
}