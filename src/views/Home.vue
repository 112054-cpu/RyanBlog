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
    <div v-else-if="error" class="luxury-card bg-red-50 border-red-200">
      <p class="text-red-700">{{ error }}</p>
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
