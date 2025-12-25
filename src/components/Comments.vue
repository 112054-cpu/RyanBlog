<template>
  <div class="comments-section mt-12 border-t border-luxury-purple/20 pt-8">
    <h2 class="font-display text-3xl font-bold text-luxury-purple mb-8">
      留言 <span class="text-xl text-gray-600">({{ comments.length }})</span>
    </h2>

    <!-- Comment Form -->
    <div v-if="isAuthenticated" class="mb-8">
      <div class="bg-gradient-to-r from-luxury-cream to-white p-6 rounded-lg shadow-md">
        <textarea
          v-model="newComment"
          placeholder="分享您的想法..."
          class="w-full p-4 border border-luxury-purple/30 rounded-lg focus:ring-2 focus:ring-luxury-purple focus:border-transparent resize-none"
          rows="4"
          :disabled="submitting"
        ></textarea>
        <div class="mt-4 flex justify-between items-center">
          <p class="text-sm text-gray-600">
            💡 您的留言將在管理員批准後顯示
          </p>
          <button
            @click="submitComment"
            :disabled="!newComment.trim() || submitting"
            class="px-6 py-2 bg-luxury-purple text-white rounded-lg hover:bg-luxury-purple-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
          >
            {{ submitting ? '提交中...' : '發表留言' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Login prompt -->
    <div v-else class="mb-8">
      <div class="bg-gradient-to-r from-luxury-cream to-white p-6 rounded-lg shadow-md text-center">
        <p class="text-gray-700 mb-4">請先登入才能留言</p>
        <router-link
          to="/login"
          class="inline-block px-6 py-2 bg-luxury-purple text-white rounded-lg hover:bg-luxury-purple-dark transition-all duration-300 shadow-md hover:shadow-lg"
        >
          前往登入
        </router-link>
      </div>
    </div>

    <!-- Comments List -->
    <div class="space-y-6">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="bg-white p-6 rounded-lg shadow-md border border-luxury-purple/10 hover:shadow-lg transition-shadow duration-300"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-gradient-to-br from-luxury-purple to-luxury-rose rounded-full flex items-center justify-center text-white font-bold">
                {{ getInitial(comment.user_profiles?.display_name) }}
              </div>
              <div>
                <p class="font-semibold text-gray-900">
                  {{ comment.user_profiles?.display_name || '匿名用戶' }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ formatDate(comment.created_at) }}
                </p>
              </div>
            </div>
            <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {{ comment.content }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="comments.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">💬</div>
        <p class="text-gray-500 text-lg">尚無留言，成為第一個留言的人吧！</p>
      </div>
    </div>

    <!-- Success message -->
    <div
      v-if="showSuccess"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in"
    >
      ✓ 留言已提交，等待審核中
    </div>

    <!-- Error message -->
    <div
      v-if="error"
      class="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in"
    >
      ✗ {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { commentsApi } from '../services/supabase'
import { authUtils } from '../utils/auth'

const props = defineProps({
  articleId: {
    type: String,
    required: true
  }
})

const comments = ref([])
const newComment = ref('')
const isAuthenticated = ref(false)
const submitting = ref(false)
const showSuccess = ref(false)
const error = ref('')

onMounted(async () => {
  await checkAuth()
  await loadComments()
})

async function checkAuth() {
  isAuthenticated.value = await authUtils.isAuthenticated()
}

async function loadComments() {
  try {
    comments.value = await commentsApi.getByArticleId(props.articleId)
  } catch (err) {
    console.error('載入留言失敗:', err)
  }
}

async function submitComment() {
  if (!newComment.value.trim()) return
  
  submitting.value = true
  error.value = ''
  
  try {
    await commentsApi.create({
      article_id: props.articleId,
      content: newComment.value.trim()
    })
    
    newComment.value = ''
    showSuccess.value = true
    
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)
  } catch (err) {
    console.error('提交留言失敗:', err)
    error.value = err.message || '提交失敗，請稍後再試'
    
    setTimeout(() => {
      error.value = ''
    }, 3000)
  } finally {
    submitting.value = false
  }
}

function getInitial(name) {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes <= 1 ? '剛剛' : `${minutes} 分鐘前`
    }
    return `${hours} 小時前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days} 天前`
  } else {
    return date.toLocaleDateString('zh-TW', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
