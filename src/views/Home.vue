<template>
  <div class="space-y-8">
    <!-- Hero Section -->
    <section class="text-center py-16 luxury-card bg-gradient-to-r from-luxury-purple/10 to-luxury-gold/10">
      <h1 class="text-5xl md:text-6xl font-bold text-luxury-deepPurple mb-4 font-playfair">
        歡迎來到 <span class="text-luxury-gold">Ryan's Blog</span>
      </h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        分享生活點滴，記錄美好瞬間，用華麗的視角看世界
      </p>
    </section>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-luxury-gold border-t-transparent"></div>
      <p class="mt-4 text-gray-600">載入文章中...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="luxury-card bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
      <div class="text-center">
        <div class="text-6xl mb-4">⚠️</div>
        <h2 class="text-2xl font-playfair font-bold text-red-700 mb-3">需要設置 Supabase</h2>
        <p class="text-red-600 mb-4">{{ error }}</p>
        
        <div class="bg-white rounded-lg p-6 text-left max-w-2xl mx-auto mb-6 shadow-lg">
          <h3 class="text-lg font-bold text-luxury-deepPurple mb-3">🚀 快速設置步驟：</h3>
          <ol class="space-y-2 text-gray-700">
            <li class="flex items-start">
              <span class="font-bold text-luxury-gold mr-2">1.</span>
              <span>前往 <a href="https://app.supabase.com" target="_blank" class="text-luxury-purple underline hover:text-luxury-gold">app.supabase.com</a> 創建專案</span>
            </li>
            <li class="flex items-start">
              <span class="font-bold text-luxury-gold mr-2">2.</span>
              <span>執行 <code class="bg-gray-100 px-2 py-1 rounded text-sm">SUPABASE_SETUP.md</code> 中的 SQL 腳本</span>
            </li>
            <li class="flex items-start">
              <span class="font-bold text-luxury-gold mr-2">3.</span>
              <span>複製專案的 URL 和 API Key 到 <code class="bg-gray-100 px-2 py-1 rounded text-sm">.env</code> 文件</span>
            </li>
            <li class="flex items-start">
              <span class="font-bold text-luxury-gold mr-2">4.</span>
              <span>重啟開發伺服器</span>
            </li>
          </ol>
        </div>
        
        <div class="flex justify-center space-x-4">
          <a 
            href="https://app.supabase.com" 
            target="_blank"
            class="luxury-button-gold inline-block"
          >
            前往 Supabase
          </a>
          <button 
            @click="loadArticles"
            class="luxury-button inline-block"
          >
            重試連接
          </button>
        </div>
      </div>
    </div>

    <!-- Articles Grid -->
    <div v-else-if="articles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <ArticleCard 
        v-for="article in articles" 
        :key="article.id" 
        :article="article"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16 luxury-card">
      <div class="text-6xl mb-4">📝</div>
      <h2 class="text-2xl font-playfair font-bold text-gray-700 mb-2">尚無文章</h2>
      <p class="text-gray-500 mb-6">開始撰寫您的第一篇文章吧！</p>
      <router-link 
        v-if="isAuthenticated"
        to="/editor" 
        class="luxury-button inline-block"
      >
        撰寫文章
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import ArticleCard from '../components/ArticleCard.vue'
import { articlesApi } from '../services/supabase'

export default {
  name: 'Home',
  components: {
    ArticleCard
  },
  setup() {
    const articles = ref([])
    const loading = ref(true)
    const error = ref('')
    const isAuthenticated = ref(false)

    const loadArticles = async () => {
      try {
        loading.value = true
        error.value = ''
        articles.value = await articlesApi.getAll()
      } catch (err) {
        console.error('Error loading articles:', err)
        error.value = '載入文章失敗，請確認 Supabase 連線設定'
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      isAuthenticated.value = !!localStorage.getItem('isAuthenticated')
      loadArticles()
    })

    return {
      articles,
      loading,
      error,
      isAuthenticated
    }
  }
}
</script>
