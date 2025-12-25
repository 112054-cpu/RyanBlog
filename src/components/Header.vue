<template>
  <header class="bg-gradient-to-r from-luxury-purple via-luxury-deepPurple to-luxury-purple shadow-2xl sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
    <nav class="container mx-auto px-4 py-6">
      <div class="flex justify-between items-center">
        <router-link to="/" class="flex items-center space-x-3 group">
          <div class="w-12 h-12 bg-gold-gradient rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
            <span class="text-2xl">✨</span>
          </div>
          <h1 class="text-3xl font-bold text-white font-playfair">
            Ryan's <span class="text-luxury-gold">Blog</span>
          </h1>
        </router-link>
        
        <div class="flex items-center space-x-6">
          <router-link 
            to="/" 
            class="text-white hover:text-luxury-gold transition-colors duration-300 text-lg font-semibold"
          >
            首頁
          </router-link>
          
          <router-link 
            v-if="isAdmin"
            to="/editor" 
            class="luxury-button-gold text-sm"
          >
            ✍️ 撰寫文章
          </router-link>

          <router-link 
            v-if="isAdmin"
            to="/comments" 
            class="text-white hover:text-luxury-gold transition-colors duration-300 text-lg flex items-center"
          >
            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            評論審核
            <span v-if="pendingCount > 0" class="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {{ pendingCount }}
            </span>
          </router-link>
          
          <button 
            v-if="isAuthenticated"
            @click="logout"
            class="text-white hover:text-luxury-gold transition-colors duration-300 text-lg"
          >
            登出
          </button>
          
          <router-link 
            v-else
            to="/admin" 
            class="text-white hover:text-luxury-gold transition-colors duration-300 text-lg"
          >
            登入
          </router-link>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authUtils } from '../utils/auth'
import { commentsApi } from '../services/supabase'

export default {
  name: 'Header',
  setup() {
    const router = useRouter()
    const isAuthenticated = ref(false)
    const isAdmin = ref(false)
    const pendingCount = ref(0)

    const checkAuth = async () => {
      isAuthenticated.value = await authUtils.validateToken()
      if (isAuthenticated.value) {
        isAdmin.value = await authUtils.isAdmin()
        if (isAdmin.value) {
          await loadPendingCount()
        }
      }
    }

    const loadPendingCount = async () => {
      try {
        const pending = await commentsApi.getPending()
        pendingCount.value = pending.length
      } catch (err) {
        console.error('載入待審核留言數量失敗:', err)
      }
    }

    const logout = async () => {
      await authUtils.signOut()
      isAuthenticated.value = false
      isAdmin.value = false
      pendingCount.value = 0
      router.push('/')
    }

    onMounted(() => {
      checkAuth()
      window.addEventListener('storage', checkAuth)
      
      // Refresh pending count every 30 seconds if admin
      setInterval(async () => {
        if (isAdmin.value) {
          await loadPendingCount()
        }
      }, 30000)
    })

    return {
      isAuthenticated,
      isAdmin,
      pendingCount,
      logout
    }
  }
}
</script>
