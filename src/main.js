import Vue from 'vue'
import 'normalize.css/normalize.css' // A modern alternative to CSS resets
// import Blob from './excel/Blob.js'
// import Export2Excel from './excel/Export2Excel.js'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import JsonExcel from 'vue-json-excel'
import ElTreeSelect from 'el-tree-select'

Vue.component('downloadExcel', JsonExcel)
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css
import './assets/css/global.css' // 引入 公共样式

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

import iView from 'iview'
import 'iview/dist/styles/iview.css'

import VueQuillEditor from 'vue-quill-editor'
// require styles 引入样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
Vue.use(VueQuillEditor)

Vue.use(ElTreeSelect)

Vue.use(iView)
Vue.use(Element, { size: 'small' })

import v_distpicker from 'v-distpicker'
Vue.component('v-distpicker',v_distpicker);

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
    const { mockXHR } = require('../mock')
    mockXHR()
}

// set ElementUI lang to EN
// Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
Vue.use(ElementUI)

import aMap from 'vue-amap'
Vue.use(aMap)


import JsonViewer from 'vue-json-viewer'
Vue.use(JsonViewer)

aMap.initAMapApiLoader({
    key: 'de9197355ae629a287eb4c440ea3dda6', // 你的key
    //用到的插件
    plugin: ['AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.OverView', 'AMap.ToolBar',
        'AMap.MapType', 'AMap.Geolocation', 'AMap.Geocoder', 'AMap.AMapManager', 'AMap.Marker'
    ],
    v: '1.4.4', //版本
    uiVersion: '1.0' //ui版本
})

Vue.config.productionTip = false

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
})
