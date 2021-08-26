// oninput="if(value.length>16)value=value.slice(0,16)" 

// 设备列表
export const devnameReg = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('不能为空！'))
        return
    }
    if (value.trim().length > 16) {
        return callback(new Error('不能超过16个字符！'))
    } else {
        callback()
    }
}
export const cardIdReg2 = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('不能为空！'))
        return
    }
    if (value.trim().length != 15) {
        callback(new Error('请输入15位IMEI字符,不能输入汉字!'))
        return
    }
    if (/[\u4E00-\u9FA5]/g.test(value)) {
        callback(new Error('请输入15位IMEI字符,不能输入汉字!'))
        return
    }
}
export const devtypeReg = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('不能为空！'))
        return
    }
    if (value.trim().length > 16) {
        return callback(new Error('不能超过16位字符,不能输入汉字!'))
    }
    if (/[\u4E00-\u9FA5]/g.test(value)) {
        return callback(new Error('不能超过16位字符,不能输入汉字!'))
    }
}
export const remarksReg = (rule, value, callback) => {
    if (value.trim().length > 200) {
        return callback(new Error('不能超过200个字符！'))
    } else {
        callback()
    }
}
export const addressReg = (rule, value, callback) => {
    if (value.trim().length > 100) {
        return callback(new Error('不能超过100个字符！'))
    } else {
        callback()
    }
}


// 电池组
export const noChinese = (rule, value, callback) => {
    if (/[\u4E00-\u9FA5]/g.test(value)) {
        return callback(new Error('不能输入汉字!'))
    }
}
export const limited = (rule, value, callback) => {
    if (value.trim().length > 30) {
        return callback(new Error('不能超过30个字符！'))
    }
}
export const lt0 = (rule, value, callback) => {
    if (value < 0) {
        return callback(new Error('不能超过小于0！'))
    }
}