<template>
  <div class="max-w-md mx-auto">
    <div class="luxury-card">
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gold-gradient rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-4xl">🔐</span>
        </div>
        <h1 class="text-3xl font-bold text-luxury-deepPurple font-playfair">
          管理員登入
        </h1>
        <p class="text-gray-600 mt-2">請輸入管理員密碼</p>
      </div>

      <form @submit.prevent="login" class="space-y-6">
        <div>
          <label class="block text-lg font-semibold text-gray-700 mb-2">
            密碼
          </label>
          <input 
            v-model="password"
            type="password" 
            required
            class="w-full px-4 py-3 border-2 border-luxury-gold/30 rounded-lg focus:border-luxury-gold focus:outline-none transition-colors duration-300"
            placeholder="輸入管理員密碼..."
          />
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
          {{ error }}
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="luxury-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">登入中...</span>
          <span v-else">登入</span>
        </button>

        <div class="text-center">
          <router-link 
            to="/" 
            class="text-luxury-purple hover:text-luxury-gold transition-colors duration-300"
          >
            返回首頁
          </router-link>
        </div>
      </form>

      <div class="mt-8 p-4 bg-luxury-cream rounded-lg">
        <p class="text-sm text-gray-600 text-center">
          💡 提示：預設密碼為 <code class="bg-white px-2 py-1 rounded">admin123</code>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/supabase'

export default {
  name: 'AdminLogin',
  setup() {
    const router = useRouter()
    const password = ref('')
    const error = ref('')
    const loading = ref(false)

    const login = async () => {
      try {
        loading.value = true
        error.value = ''
        
        // 使用 Supabase Auth 登入（需先在 Supabase 創建用戶）
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: 'admin@ryanblog.local',
          password: password.value
        })
        
        if (authError) {
          error.value = '密碼錯誤，請重試'
          password.value = ''
          return
        }
        
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('supabase_token', data.session.access_token)
        window.dispatchEvent(new Event('storage'))
        router.push('/editor')
      } catch (err) {
        console.error('登入錯誤:', err)
        error.value = '登入失敗，請稍後再試'
      } finally {
        loading.value = false
      }
    }

    return {
      password,
      error,
      loading,
      login
    }
  }
}
</script>
