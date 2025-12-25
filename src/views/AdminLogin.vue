<template>
  <div class="max-w-md mx-auto">
    <div class="luxury-card">
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gold-gradient rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-4xl">🔐</span>
        </div>
        <h1 class="text-3xl font-bold text-luxury-deepPurple font-playfair">
          {{ isSignUp ? '創建管理員帳號' : '管理員登入' }}
        </h1>
        <p class="text-gray-600 mt-2">
          {{ isSignUp ? '設定您的管理員帳號密碼' : '請輸入管理員密碼' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-lg font-semibold text-gray-700 mb-2">
            Email
          </label>
          <input 
            v-model="email"
            type="email" 
            required
            class="w-full px-4 py-3 border-2 border-luxury-gold/30 rounded-lg focus:border-luxury-gold focus:outline-none transition-colors duration-300"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label class="block text-lg font-semibold text-gray-700 mb-2">
            密碼
          </label>
          <input 
            v-model="password"
            type="password" 
            required
            :minlength="isSignUp ? 6 : 1"
            class="w-full px-4 py-3 border-2 border-luxury-gold/30 rounded-lg focus:border-luxury-gold focus:outline-none transition-colors duration-300"
            :placeholder="isSignUp ? '至少 6 個字符...' : '輸入管理員密碼...'"
          />
          <p v-if="isSignUp" class="text-sm text-gray-500 mt-1">
            密碼至少需要 6 個字符
          </p>
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
          {{ error }}
        </div>

        <div v-if="success" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center">
          {{ success }}
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="luxury-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">{{ isSignUp ? '創建中...' : '登入中...' }}</span>
          <span v-else>{{ isSignUp ? '創建帳號' : '登入' }}</span>
        </button>

        <div class="text-center">
          <button
            type="button"
            @click="toggleMode"
            class="text-luxury-purple hover:text-luxury-gold transition-colors duration-300"
          >
            {{ isSignUp ? '已有帳號？點此登入' : '沒有帳號？點此創建' }}
          </button>
        </div>

        <div class="text-center">
          <router-link 
            to="/" 
            class="text-gray-500 hover:text-luxury-gold transition-colors duration-300"
          >
            返回首頁
          </router-link>
        </div>
      </form>
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
    const email = ref('')
    const password = ref('')
    const error = ref('')
    const success = ref('')
    const loading = ref(false)
    const isSignUp = ref(false)

    const toggleMode = () => {
      isSignUp.value = !isSignUp.value
      error.value = ''
      success.value = ''
    }

    const signUp = async () => {
      try {
        loading.value = true
        error.value = ''
        success.value = ''
        
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.value,
          password: password.value,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
            // 自動確認 email（需要在 Supabase 設置中啟用）
            data: {
              auto_confirm: true
            }
          }
        })
        
        if (authError) {
          // 顯示更友善的錯誤訊息
          if (authError.message.includes('already registered')) {
            error.value = '此 Email 已被註冊，請直接登入'
          } else {
            error.value = '註冊失敗：' + authError.message
          }
          return
        }
        
        // 檢查是否需要 email 驗證
        if (data.user && !data.session) {
          // 需要 email 驗證
          success.value = '✅ 帳號創建成功！請查看您的信箱完成驗證。如果沒收到郵件，可以直接使用此帳號登入（某些設置下可跳過驗證）。'
          // 3 秒後切換到登入模式
          setTimeout(() => {
            isSignUp.value = false
            success.value = ''
          }, 3000)
        } else if (data.session) {
          // 直接登入成功（email 驗證已禁用）
          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('supabase_token', data.session.access_token)
          window.dispatchEvent(new Event('storage'))
          success.value = '✅ 帳號創建成功！正在跳轉...'
          setTimeout(() => {
            router.push('/editor')
          }, 1000)
        } else {
          // 帳號創建成功但狀態不明確，引導用戶登入
          success.value = '✅ 帳號創建成功！請使用此帳號登入。'
          setTimeout(() => {
            isSignUp.value = false
            success.value = ''
          }, 2000)
        }
      } catch (err) {
        console.error('註冊錯誤:', err)
        error.value = '註冊失敗，請稍後再試'
      } finally {
        loading.value = false
      }
    }

    const login = async () => {
      try {
        loading.value = true
        error.value = ''
        success.value = ''
        
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.value,
          password: password.value
        })
        
        if (authError) {
          // 提供更友善的錯誤訊息
          if (authError.message.includes('Invalid login credentials')) {
            error.value = '❌ 登入失敗：帳號或密碼錯誤。如果您還沒有帳號，請點擊下方「沒有帳號？點此創建」註冊。'
          } else if (authError.message.includes('Email not confirmed')) {
            error.value = '⚠️ 請先確認您的 Email。請查看信箱中的驗證郵件。'
          } else {
            error.value = '登入失敗：' + authError.message
          }
          return
        }
        
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('supabase_token', data.session.access_token)
        window.dispatchEvent(new Event('storage'))
        success.value = '✅ 登入成功！'
        setTimeout(() => {
          router.push('/editor')
        }, 500)
      } catch (err) {
        console.error('登入錯誤:', err)
        error.value = '登入失敗，請稍後再試'
      } finally {
        loading.value = false
      }
    }

    const handleSubmit = () => {
      if (isSignUp.value) {
        signUp()
      } else {
        login()
      }
    }

    return {
      email,
      password,
      error,
      success,
      loading,
      isSignUp,
      toggleMode,
      handleSubmit
    }
  }
}
</script>
