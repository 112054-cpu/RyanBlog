<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-luxury-purple/10 via-white to-luxury-rose/10">
    <div class="luxury-card max-w-md w-full text-center">
      <!-- Loading State -->
      <div v-if="loading">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-luxury-gold border-t-transparent mb-4"></div>
        <h2 class="text-2xl font-bold text-luxury-deepPurple mb-2">
          正在驗證您的帳號...
        </h2>
        <p class="text-gray-600">請稍候</p>
      </div>

      <!-- Success State -->
      <div v-else-if="success">
        <div class="text-6xl mb-4">✅</div>
        <h2 class="text-2xl font-bold text-green-600 mb-2">
          帳號驗證成功！
        </h2>
        <p class="text-gray-600 mb-6">
          您的帳號已成功驗證，現在可以登入使用了。
        </p>
        <router-link to="/login" class="luxury-button inline-block">
          前往登入
        </router-link>
      </div>

      <!-- Error State -->
      <div v-else-if="error">
        <div class="text-6xl mb-4">❌</div>
        <h2 class="text-2xl font-bold text-red-600 mb-2">
          驗證失敗
        </h2>
        <p class="text-gray-600 mb-4">
          {{ errorMessage }}
        </p>
        <div class="space-y-2">
          <button @click="retry" class="luxury-button w-full">
            重試
          </button>
          <router-link to="/login" class="luxury-button-outline w-full inline-block">
            返回登入頁面
          </router-link>
        </div>
      </div>

      <!-- Already Verified State -->
      <div v-else-if="alreadyVerified">
        <div class="text-6xl mb-4">ℹ️</div>
        <h2 class="text-2xl font-bold text-blue-600 mb-2">
          帳號已驗證
        </h2>
        <p class="text-gray-600 mb-6">
          您的帳號已經完成驗證，可以直接登入。
        </p>
        <router-link to="/login" class="luxury-button inline-block">
          前往登入
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../services/supabase'

const router = useRouter()
const loading = ref(true)
const success = ref(false)
const error = ref(false)
const alreadyVerified = ref(false)
const errorMessage = ref('')

const handleEmailConfirmation = async () => {
  try {
    loading.value = true
    error.value = false
    success.value = false
    alreadyVerified.value = false

    // 檢查 URL 中的 token
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const type = hashParams.get('type')
    const errorCode = hashParams.get('error')
    const errorDescription = hashParams.get('error_description')

    if (import.meta.env.DEV) {
      console.log('Auth callback params:', { type, errorCode, errorDescription, hasToken: !!accessToken })
    }

    // 檢查是否有錯誤
    if (errorCode) {
      if (errorCode === 'access_denied' && errorDescription?.includes('already been confirmed')) {
        alreadyVerified.value = true
        return
      }
      throw new Error(errorDescription || '驗證過程發生錯誤')
    }

    // 檢查是否為郵件確認
    if (type === 'signup' || type === 'email') {
      if (!accessToken) {
        throw new Error('缺少驗證令牌')
      }

      // Supabase 會自動處理 session，我們只需要確認
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError
      
      if (session) {
        success.value = true
        
        // 3秒後自動跳轉到登入頁面
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        throw new Error('無法建立登入會話')
      }
    } else {
      // 檢查當前是否已登入
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email_confirmed_at) {
        alreadyVerified.value = true
      } else {
        throw new Error('無效的驗證類型')
      }
    }
  } catch (err) {
    console.error('Email confirmation error:', err)
    error.value = true
    errorMessage.value = err.message || '驗證失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}

const retry = () => {
  handleEmailConfirmation()
}

onMounted(() => {
  handleEmailConfirmation()
})
</script>

<style scoped>
.luxury-button-outline {
  @apply px-6 py-3 border-2 border-luxury-purple text-luxury-purple rounded-lg hover:bg-luxury-purple hover:text-white transition-all duration-300 font-semibold;
}
</style>
