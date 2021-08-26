
const state = {
  // highlightId: undefined // 需要高亮的id
  highlightId: 'dudu' // 需要高亮的id
}
const mutations = {
  CHANGE_HIGHLIGHT_ID: (state, id) => {
    state.highlightId = id
  }
}
const actions = {
  changeHighlightId({ commit }, id) {
    console.log('actions', id)
    commit('CHANGE_HIGHLIGHT_ID', id)
  }
}
// 设备巡检的状态管理
export default {
  namespaced: true,
  state,
  mutations,
  actions
}
