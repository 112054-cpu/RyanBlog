<template>
  <div class="luxury-card hover:border-luxury-gold/50 cursor-pointer fade-in" @click="goToArticle">
    <div v-if="article.photos && article.photos.length > 0" class="mb-4 overflow-hidden rounded-lg">
      <img 
        :src="article.photos[0].url" 
        :alt="article.title"
        class="w-full h-64 object-cover transform hover:scale-110 transition-transform duration-500"
      />
    </div>
    
    <div class="flex items-center justify-between mb-3 text-sm text-gray-500">
      <span class="flex items-center">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {{ formatDate(article.created_at) }}
      </span>
      
      <span v-if="article.photos" class="flex items-center text-luxury-gold">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {{ article.photos.length }}
      </span>
    </div>
    
    <h2 class="text-2xl font-bold mb-3 text-luxury-deepPurple font-playfair hover:text-luxury-gold transition-colors duration-300">
      {{ article.title }}
    </h2>
    
    <p class="text-gray-600 mb-4 line-clamp-3">
      {{ article.excerpt || article.content.substring(0, 150) + '...' }}
    </p>
    
    <div class="flex justify-between items-center">
      <button class="text-luxury-purple hover:text-luxury-gold font-semibold flex items-center transition-colors duration-300">
        閱讀更多
        <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'ArticleCard',
  props: {
    article: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const goToArticle = () => {
      router.push(`/article/${props.article.id}`)
    }

    return {
      formatDate,
      goToArticle
    }
  }
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
