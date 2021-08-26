import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'
const getDefaultState = () => {
  return {
    token: getToken(),
    loginName: '',
    name: '',
    avatar: '',
    id: '',
    userInfo: {},
    roles: []
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: state => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_LOGINNAME: (state, loginName) => {
    state.loginName = loginName
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ID: (state, id) => {
    state.id = id
  },
  set_confitItemData: (state, confitItemData) => {
    state.confitItemData = confitItemData
  },
  set_userInfo: (state, userInfo) => {
    state.userInfo = userInfo
  },
  set_roles: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password, verifyCode } = userInfo
    return new Promise((resolve, reject) => {
      login({
        username: username.trim(),
        password: password,
        verifyCode: verifyCode
      })
        .then(response => {
          const { data } = response
          commit('SET_TOKEN', data.token)
          setToken(data.token)
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token)
        .then(response => {
          const { data } = response
          if (!data) {
            return reject(' 验证失败，请重新登录！')
          }
          const userInfo = JSON.stringify(response.data)
          sessionStorage.setItem('userInfo', userInfo)
          commit('SET_NAME', data.nickName)
          commit('SET_LOGINNAME', data.loginName)
          commit('SET_AVATAR', data.photo)
          commit('SET_ID', data.id)
          commit('set_userInfo', response.data)
          commit('set_roles', response.data.roles)
          resolve(data)
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      const loginName = state.loginName
      logout({ username: loginName })
        .then(() => {
          removeToken() // must remove  token  first
          sessionStorage.clear()
          resetRouter()
          commit('RESET_STATE')
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
