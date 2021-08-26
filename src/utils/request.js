import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 8000
})

service.interceptors.request.use(
  config => {
    // do something before request is sent
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      // config.headers['content-type'] = 'application/json'
      config.headers['token'] = getToken()
    }
    return config
  },
  error => {
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data
    // console.log('response.code', response.code)
    // console.log('res.code', res.code)
    if (res.code && res.code !== '0') {
      if (res.code === '101001' || res.code === '101002') {
        Message({
          message: res.data || res.msg,
          type: 'error'
        })
        // console.log('token 无效')
        store.dispatch('user/resetToken').then(() => {
          location.reload()
        })
        return Promise.reject(response)
      } else {
        Message({
          message: res.data || res.msg,
          type: 'error'
        })
        return Promise.reject(response)
      }
      return Promise.reject(new Error(res.msg || 'error'))
      // return Promise.resolve(response)
    } else {
      return res
    }
  },
  error => {
    Message({
      message: '服务异常，请稍后重试~',
      type: 'error'
    })
    // console.log('err' + error)
    return Promise.reject(error)
  }
)

export default service
