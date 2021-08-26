import request from '@/utils/request'

export function login(data) {
    return request({
        url: '/login',
        method: 'get',
        params: data
    })
}
export function getInfo(token) {
    return request({
        url: '/sys/user/userInfo',
        method: 'get'

    })
}
export function logout(data) {
    return request({
        url: '/logout',
        method: 'get',
        params: data
    })
}
// 查询用户列表
export function userList(data) {
    return request({
        url: 'sys/user/list',
        method: 'post',
        data
    })
}
// 分页查询
export function userPage(data) {
    return request({
        url: 'sys/user/page',
        method: 'post',
        data
    })
}
// 新增用户
export function userSave(data) {
    return request({
        url: 'sys/user/save',
        method: 'post',
        data
    })
}
// 删除用户
export function userDelete(data) {
    return request({
        url: 'sys/user/delete',
        method: 'delete',
        data
    })
}
// 更新用户
export function userUpdate(data) {
    return request({
        url: 'sys/user/update',
        method: 'put',
        data
    })
}
// 角色列表
export function roleList(data) {
    return request({
        url: 'sys/role/list',
        method: 'post',
        data
    })
}
// 修改密码
export function changePwd(data) {
    return request({
        url: 'sys/user/changePwd',
        method: 'post',
        params: data
    })
}
// 用户图片上传
export function uploadPhoto(data) {
    return request({
        url: '/sys/file/uploadPhoto',
        method: 'post',
        data
    })
}
// 获取登录验证码
export function captcha(data) {
    return request({
        url: '/captcha',
        method: 'get',
        params: data
    })
}