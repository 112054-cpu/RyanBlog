import { createRouter, createWebHistory } from 'vue-router'
import { authUtils } from '../utils/auth'

// Lazy loading components for better performance
const Home = () => import('../views/Home.vue')
const ArticleDetail = () => import('../views/ArticleDetail.vue')
const ArticleEditor = () => import('../views/ArticleEditor.vue')
const AdminLogin = () => import('../views/AdminLogin.vue')
const CommentModeration = () => import('../views/CommentModeration.vue')

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
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/editor/:id',
    name: 'EditArticle',
    component: ArticleEditor,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: AdminLogin
  },
  {
    path: '/admin',
    redirect: '/login'
  },
  {
    path: '/comments',
    name: 'CommentModeration',
    component: CommentModeration,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Auth guard with token validation and admin check
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const isValid = await authUtils.validateToken()
    if (!isValid) {
      next('/login')
      return
    }
    
    // Check admin role if required
    if (to.meta.requiresAdmin) {
      const isAdmin = await authUtils.isAdmin()
      if (!isAdmin) {
        alert('此功能僅限管理員使用')
        next('/')
        return
      }
    }
    
    next()
  } else {
    next()
  }
})

export default router
