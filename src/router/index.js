import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [{
  path: '/login',
  component: () =>
    import ('@/views/login/index'),
  hidden: true
},

{
  path: '/addKnowledge',
  hidden: true,
  component: Layout,
  redirect: '/addKnowledge/addKnowledge',
  name: 'addKnowledge',
  meta: {
    title: '新增知识'
  },
  children: [{
    path: 'addKnowledge',
    component: () =>
      import ('@/views/knowledge/addKnowledge')
  }]
},
{
  path: '/knowledgeDetails',
  hidden: true,
  component: Layout,
  redirect: '/knowledgeDetails/knowledgeDetails',
  name: 'knowledgeDetails',
  meta: {
    title: '知识预览'
  },
  children: [{
    path: 'knowledgeDetails',
    component: () =>
      import ('@/views/knowledge/knowledgeDetails')
  }]
},
{
  path: '/questionDetails',
  hidden: true,
  component: Layout,
  redirect: '/questionDetails/questionDetails',
  name: 'questionDetails',
  meta: {
    title: '问题详情'
  },
  children: [{
    path: 'questionDetails',
    component: () =>
      import ('@/views/knowledge/questionDetails')
  }]
},

{
  path: '/personalCenter',
  component: Layout,
  redirect: '/personalCenter/personalCenter',
  name: 'personalCenter',
  meta: {
    title: '个人中心'
  },
  children: [{
    path: 'personalCenter',
    component: () =>
      import ('@/views/personal/PersonalCenter')
  }]
},

{
  path: '/config',
  hidden: true,
  component: Layout,
  redirect: 'config/config',
  name: 'config',
  meta: {
    title: '配置'
  },
  children: [{
    path: 'config',
    component: () =>
      import ('@/views/devices/config')
  }]
},
{
  path: '/batteryPack',
  hidden: true,
  component: Layout,
  redirect: 'batteryPack/batteryPack',
  name: 'batteryPack',
  meta: {
    title: '电池组配置'
  },
  children: [{
    path: 'batteryPack',
    component: () =>
      import ('@/views/devices/batteryPack')
  }]
},

{
  path: '*',
  component: () =>
    import ('@/views/404'),
  hidden: true
  }

]

export const asyncRoutes = [
  {
    path: '/',
    component: Layout,
    redirect: 'devOverview',
    name: 'statistic',
    meta: {
      title: '统计分析',
      icon: 'index'
    },
    children: [{
      path: 'devOverview',
      name: 'devOverview',
      component: () =>
        import ('@/views/statistic/devOverview'),
      meta: { title: '设备概览', icon: 'overview' }
    },
    {
      path: 'sysMonitor',
      name: 'sysMonitor',
      component: () =>
        import ('@/views/statistic/sysMonitor'),
      meta: { title: '系统监控', icon: 'dashboard' }
    }
    ]
  },

  {
    path: '/devices',
    component: Layout,
    redirect: '/devices/list',
    name: 'devices',
    meta: { title: '设备管理', icon: 'devices' },
    children: [{
      path: 'devicesList',
      name: 'devicesList',
      component: () =>
        import ('@/views/devices/devicesList'),
      meta: { title: '设备列表', icon: 'table' }
    },
    {
      path: 'monitor',
      name: 'devicesMonitor',
      component: () =>
        import ('@/views/devices/devicesMonitor'),
      meta: { title: '设备监控', icon: 'tree' },
      props: true
    },
    {
      path: 'inspection',
      name: 'devicesInspection',
      component: () =>
        import ('@/views/devices/devicesInspection'),
      meta: { title: '设备巡检', icon: 'sbxj' },
      props: true
    },
    {
      path: 'update',
      name: 'hardwareUpdate',
      component: () =>
        import ('@/views/devices/hardwareUpdate'),
      meta: { title: '固件升级', icon: 'gjsj' }
    },
    {
      path: 'alarms',
      name: 'devicesAlarms',
      component: () =>
        import ('@/views/devices/devicesAlarms'),
      meta: { title: '设备告警', icon: 'sbgj' }
    }
    ]
  },
  {
    path: '/assets',
    component: Layout,
    redirect: '/assets',
    meta: { title: '资产管理', icon: 'assets' },
    children: [{
      path: 'assets',
      name: 'assets',
      component: () =>
        import ('@/views/assets/assets'),
      meta: { title: '资产管理', icon: 'assets' }
    }]
  },
  {
    path: '/log',
    component: Layout,
    redirect: '/log',
    meta: { title: '日志管理', icon: 'log' },
    children: [{
      path: 'log',
      name: 'log',
      component: () =>
        import ('@/views/log/log'),
      meta: { title: '日志管理', icon: 'log' }
    }]
  },
  {
    path: '/sys',
    component: Layout,
    redirect: '/sys/user',
    name: 'sys',
    meta: {
      title: '系统管理',
      icon: 'settings'
    },
    children: [{
      path: 'user',
      component: () =>
        import ('@/views/sys/user'),
      name: 'user',
      meta: { title: '用户管理', icon: 'user' }
    },
    {
      path: 'dept',
      component: () =>
        import ('@/views/sys/dept'),
      name: 'dept',
      meta: { title: '部门管理', icon: 'bmgl' }
    },
    {
      path: 'role',
      component: () =>
        import ('@/views/sys/role'),
      name: 'role',
      meta: { title: '角色管理', icon: 'jsgl' }
    },
    {
      path: 'menu',
      component: () =>
        import ('@/views/sys/menu'),
      name: 'menu',
      meta: { title: '菜单管理', icon: 'cdgl' }
    },
    {
      path: 'station',
      component: () =>
        import ('@/views/sys/station'),
      name: 'station',
      meta: { title: '站点管理', icon: 'zdgl' }
    },
    // {
    //   path: 'settings',
    //   component: () =>
    //     import ('@/views/sys/settings'),
    //   name: 'settings',
    //   meta: { title: '系统设置', icon: 'xtsz' }
    // },

    {
      path: 'alarm',
      component: () =>
        import ('@/views/sys/index'),
      name: 'alarm',
      redirect: '/alarm/strategy',
      meta: {
        title: '告警设置',
        icon: 'gjx'
      },
      children: [{
        path: 'strategy',
        component: () =>
          import ('@/views/sys/strategy'),
        name: 'strategy',
        meta: { title: '告警策略', icon: 'gjcl' }
      },
      {
        path: 'item',
        component: () =>
          import ('@/views/sys/item'),
        name: 'item',
        meta: { title: '告警项', icon: 'gjx' }
      }
      ]
    },
    {
      path: 'operations',
      component: () =>
        import ('@/views/sys/index'), // Parent router-view
      redirect: '/operations/task',
      name: 'alarm',
      meta: {
        title: '运维管理',
        icon: 'rwgl'
      },
      children: [{
        path: 'task',
        component: () =>
          import ('@/views/sys/task'),
        name: 'task',
        meta: { title: '定时任务', icon: 'rwgl' }
      },
      {
        path: 'clear',
        component: () =>
          import ('@/views/sys/clear'),
        name: 'clear',
        meta: { title: '系统告警', icon: 'gjqc' }
      }

      ]
    }

    ]
  },
  {
    path: '/knowledge',
    component: Layout,
    redirect: '/knowledge',
    meta: { title: '知识库', icon: 'knowledge' },
    children: [{

      path: 'knowledge',
      name: 'knowledge',
      component: () =>
        import ('@/views/knowledge/knowledge'),
      meta: { title: '知识库', icon: 'knowledge' }
    }]
    }

]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}
export default router
