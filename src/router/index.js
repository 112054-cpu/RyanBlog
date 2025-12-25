import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ArticleDetail from '../views/ArticleDetail.vue'
import ArticleEditor from '../views/ArticleEditor.vue'
import AdminLogin from '../views/AdminLogin.vue'

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

// Simple auth guard (expand with real auth later)
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    if (!isAuthenticated) {
      next('/admin')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
