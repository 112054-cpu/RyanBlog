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
            v-if="isAuthenticated"
            to="/editor" 
            class="luxury-button-gold text-sm"
          >
            ✍️ 撰寫文章
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
            管理員
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

export default {
  name: 'Header',
  setup() {
    const router = useRouter()
    const isAuthenticated = ref(false)

    const checkAuth = async () => {
      isAuthenticated.value = await authUtils.validateToken()
    }

    const logout = async () => {
      await authUtils.signOut()
      isAuthenticated.value = false
      router.push('/')
    }

    onMounted(() => {
      checkAuth()
      window.addEventListener('storage', checkAuth)
    })

    return {
      isAuthenticated,
      logout
    }
  }
}
</script>
