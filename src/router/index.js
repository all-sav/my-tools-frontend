import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../components/Dashboard.vue')
  },
  {
    path: '/mergenator',
    name: 'mergenator',
    component: () => import('../components/Mergenator.vue')
  },
  {
    path: '/welcome',
    name: 'welcome',
    component: () => import('../components/Welcome.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/welcome'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Прокрутка к сохраненной позиции или вверх страницы
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router