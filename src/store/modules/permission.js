import { asyncRoutes, constantRoutes } from '@/router'

/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
// function hasPermission(roles, route) {
//   if (route.meta && route.meta.roles) {
//     return roles.some(role => route.meta.roles.indexOf(role) >= 0)
//   } else {
//     return true
//   }
// }

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRouterMap
 * @param roles
 */
// function filterAsyncRouter(asyncRouterMap, roles) {
//   const accessedRouters = asyncRouterMap.filter(route => {
//     if (hasPermission(roles, route)) {
//       if (route.children && route.children.length) {
//         route.children = filterAsyncRouter(route.children, roles)
//       }
//       return true
//     }
//     return false
//   })
//   return accessedRouters
// }


const permission = {
  state: {
    routers: constantRoutes,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRoutes.concat(routers)
    }
  },

  actions: {
    GenerateRoutes({ commit }, roles) {
       return new Promise(resolve => {
         const strs = roles.map(x => {
          return x.menus ? x.menus : []
         }
         ).flat().map(x => x.name)
        //  console.log('strs',strs)
      //  const strs = ['设备概览', '告警设置', '告警项', '系统监控', '设备监控', '告警策略', '菜单管理', '日志管理3', '日志管理4', '部门管理', '日志管理5', '用户管理', '角色管理', '设备列表']
         const rec = (list, strs) => {
          const arr = []
          list.forEach(x => {
            const node = { ...x, children: [] }
            if (x.meta) {
              if (x.meta.title) {
        
                if (strs.includes(x.meta.title)) {
                  if (x.children) {
                    node.children = node.children.concat(rec(x.children, strs))
                  } else {
                    node.children = undefined
                  }
                  arr.push(node)
                }
              }
            }
          })
          return arr
        }
        
         const nodes= rec(asyncRoutes,strs)
        //  console.log('nodes', nodes)
        //  console.log('asyncRoutes', asyncRoutes)
        commit('SET_ROUTERS', nodes)
        resolve(nodes)
      })
    }
  }

}

export default permission
