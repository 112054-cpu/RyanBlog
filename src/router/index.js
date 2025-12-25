import { createRouter, createWebHistory } from 'vue-router'
import { authUtils } from '../utils/auth'

// Lazy loading components for better performance
const Home = () => import('../views/Home.vue')
const ArticleDetail = () => import('../views/ArticleDetail.vue')
const ArticleEditor = () => import('../views/ArticleEditor.vue')
const AdminLogin = () => import('../views/AdminLogin.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: ArticleDetail
  },
  {
    path: '/editor',
    name: 'ArticleEditor',
    component: ArticleEditor,
    meta: { requiresAuth: true }
  },
  {
    path: '/editor/:id',
    name: 'EditArticle',
    component: ArticleEditor,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminLogin',
    component: AdminLogin
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Auth guard with token validation
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const isValid = await authUtils.validateToken()
    if (!isValid) {
      next('/admin')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
