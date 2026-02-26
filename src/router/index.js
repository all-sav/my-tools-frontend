import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/components/Dashboard.vue'
import Mergenator from '@/components/Mergenator.vue'
import Welcome from '@/components/Welcome.vue'
import Settings from '../components/Settings.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Welcome,
    // Перенаправляем на dashboard с табом по умолчанию
    // beforeEnter: (to, from, next) => {
    //   next({ name: 'dashboard-with-tab', params: { tab: 'welcome' } })
    // }
  },
  // {
  //   path: '/dashboard/:tab',
  //   name: 'dashboard-with-tab',
  //   component: Dashboard,
  //   props: true
  // },
  {
    path: '/mergenator',
    name: 'mergenator',
    component: Mergenator,
    beforeEnter: (to, from, next) => {
      next({ name: 'mergenator-with-tab', params: { tab: 'merge' } })
    }
  },
  {
    path: '/mergenator/:tab',
    name: 'mergenator-with-tab',
    component: Mergenator,
    props: true
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router