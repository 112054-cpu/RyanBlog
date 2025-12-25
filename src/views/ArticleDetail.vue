<template>
  <div>
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-luxury-gold border-t-transparent"></div>
      <p class="mt-4 text-gray-600">載入文章中...</p>
    </div>

    <div v-else-if="error" class="luxury-card bg-red-50 border-red-200">
      <p class="text-red-700">{{ error }}</p>
      <router-link to="/" class="luxury-button mt-4 inline-block">返回首頁</router-link>
    </div>

    <article v-else class="max-w-4xl mx-auto space-y-8">
    <!-- Article Header -->
    <div class="luxury-card text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-luxury-deepPurple mb-4 font-playfair">
        {{ article.title }}
      </h1>
      
      <div class="flex items-center justify-center space-x-6 text-gray-500">
        <span class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ formatDate(article.created_at) }}
        </span>
        
        <span v-if="article.photos && article.photos.length > 0" class="flex items-center text-luxury-gold">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ article.photos.length }} 張照片
        </span>
      </div>

      <!-- Admin Actions -->
      <div v-if="isAuthenticated" class="mt-6 flex justify-center space-x-4">
        <button @click="editArticle" class="luxury-button-gold">
          ✏️ 編輯
        </button>
        <button @click="deleteArticle" class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300">
          🗑️ 刪除
        </button>
      </div>
    </div>

    <!-- Article Photos -->
    <div v-if="article.photos && article.photos.length > 0" class="luxury-card">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          v-for="(photo, index) in sortedPhotos" 
          :key="photo.id"
          :class="getPhotoClass(index)"
        >
          <img 
            :src="photo.url" 
            :alt="article.title"
            loading="lazy"
            class="w-full h-full object-cover rounded-lg luxury-border cursor-pointer hover:scale-105 transition-transform duration-300"
            @click="openLightbox(photo.url)"
          />
        </div>
      </div>
    </div>

    <!-- Article Content -->
    <div class="luxury-card prose prose-lg max-w-none">
      <div 
        class="text-gray-700 leading-relaxed markdown-content"
        v-html="renderMarkdown(article.content)"
      ></div>
    </div>

    <!-- Comments Section -->
    <Comments :article-id="article.id" />

    <!-- Social Share -->
    <div class="luxury-card">
      <SocialShare :url="currentUrl" :title="article.title" />
    </div>

    <!-- Back Button -->
    <div class="text-center">
      <router-link to="/" class="luxury-button inline-block">
        ← 返回首頁
      </router-link>
    </div>
  </article>

  <!-- Lightbox -->
  <div 
    v-if="lightboxImage" 
    class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
    @click="closeLightbox"
  >
    <img :src="lightboxImage" class="max-w-full max-h-full object-contain" />
    <button 
      class="absolute top-4 right-4 text-white text-4xl hover:text-luxury-gold transition-colors"
      @click="closeLightbox"
    >
      ✕
    </button>
  </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import SocialShare from '../components/SocialShare.vue'
import Comments from '../components/Comments.vue'
import { articlesApi } from '../services/supabase'

export default {
  name: 'ArticleDetail',
  components: {
    SocialShare,
    Comments
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const article = ref(null)
    const loading = ref(true)
    const error = ref('')
    const isAuthenticated = ref(false)
    const lightboxImage = ref(null)

    const currentUrl = computed(() => window.location.href)

    const sortedPhotos = computed(() => {
      if (!article.value?.photos) return []
      return [...article.value.photos].sort((a, b) => a.display_order - b.display_order)
    })

    const loadArticle = async () => {
      try {
        loading.value = true
        error.value = ''
        article.value = await articlesApi.getById(route.params.id)
      } catch (err) {
        console.error('Error loading article:', err)
        error.value = '載入文章失敗'
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getPhotoClass = (index) => {
      // 對稱排列模式：
      // 1張：佔據全部 4 格 (col-span-4)
      // 2張：各佔 2 格 (col-span-2)
      // 3張：第1張佔 2 格，第2-3張各佔 2 格
      // 4張：各佔 1 格 (預設)
      // 5張+：第1張佔 2 格置中，其餘對稱排列
      
      const total = sortedPhotos.value.length
      
      if (total === 1) {
        return 'col-span-2 md:col-span-4 row-span-2'
      } else if (total === 2) {
        return 'col-span-1 md:col-span-2 row-span-2'
      } else if (total === 3) {
        if (index === 0) return 'col-span-2 md:col-span-4 row-span-2'
        return 'col-span-1 md:col-span-2 row-span-1'
      } else if (total === 5) {
        if (index === 0) return 'col-span-2 md:col-span-4 row-span-2'
        return 'col-span-1 md:col-span-1 row-span-1'
      } else if (total >= 6) {
        if (index === 0) return 'col-span-2 md:col-span-2 row-span-2'
        return 'col-span-1 md:col-span-1 row-span-1'
      }
      
      // 4張或其他：預設每張佔 1 格
      return 'col-span-1 md:col-span-1 row-span-1'
    }

    const renderMarkdown = (content) => {
      if (!content) return ''
      
      // 配置 marked
      marked.setOptions({
        breaks: true,
        gfm: true,
        sanitize: false // 由 DOMPurify 處理清理
      })
      
      // 先渲染 Markdown，再用 DOMPurify 清理 HTML（防止 XSS 攻擊）
      const rawHTML = marked(content)
      return DOMPurify.sanitize(rawHTML, {
        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'pre', 'blockquote', 'hr', 'br', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
      })
    }

    const editArticle = () => {
      router.push(`/editor/${article.value.id}`)
    }

    const deleteArticle = async () => {
      if (!confirm('確定要刪除這篇文章嗎？')) return

      try {
        await articlesApi.delete(article.value.id)
        alert('文章已刪除')
        router.push('/')
      } catch (err) {
        console.error('Error deleting article:', err)
        alert('刪除失敗')
      }
    }

    const openLightbox = (url) => {
      lightboxImage.value = url
    }

    const closeLightbox = () => {
      lightboxImage.value = null
    }

    onMounted(() => {
      isAuthenticated.value = !!localStorage.getItem('isAuthenticated')
      loadArticle()
    })

    return {
      article,
      loading,
      error,
      isAuthenticated,
      currentUrl,
      sortedPhotos,
      lightboxImage,
      formatDate,
      getPhotoClass,
      renderMarkdown,
      editArticle,
      deleteArticle,
      openLightbox,
      closeLightbox
    }
  }
}
</script>
