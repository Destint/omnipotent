import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'app-main',
      component: require('@/components/Main').default
    },
    {
      path: '/oneKeyStart',
      name: 'app-oneKeyStart',
      component: require('@/components/OneKeyStart').default
    },
    {
      path: '/',
      name: 'app-timeRecord',
      component: require('@/components/TimeRecord').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})