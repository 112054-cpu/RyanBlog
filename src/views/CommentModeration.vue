<template>
  <div class="max-w-6xl mx-auto space-y-8">
    <div class="luxury-card text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-luxury-deepPurple font-playfair">
        評論審核管理
      </h1>
      <p class="text-gray-600 mt-2">審核並管理用戶的留言</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="luxury-card text-center">
        <div class="text-4xl font-bold text-yellow-500">{{ pendingCount }}</div>
        <div class="text-gray-600 mt-2">待審核</div>
      </div>
      <div class="luxury-card text-center">
        <div class="text-4xl font-bold text-green-500">{{ approvedCount }}</div>
        <div class="text-gray-600 mt-2">已批准</div>
      </div>
      <div class="luxury-card text-center">
        <div class="text-4xl font-bold text-red-500">{{ rejectedCount }}</div>
        <div class="text-gray-600 mt-2">已拒絕</div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="luxury-card">
      <div class="flex space-x-2 border-b border-gray-200">
        <button
          v-for="status in ['all', 'pending', 'approved', 'rejected']"
          :key="status"
          @click="filterStatus = status"
          :class="[
            'px-6 py-3 font-semibold transition-all duration-300',
            filterStatus === status
              ? 'text-luxury-purple border-b-2 border-luxury-purple'
              : 'text-gray-500 hover:text-luxury-purple'
          ]"
        >
          {{ statusLabel[status] }}
          <span class="ml-2 text-sm">({{ getCount(status) }})</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-luxury-gold border-t-transparent"></div>
      <p class="mt-4 text-gray-600">載入中...</p>
    </div>

    <!-- Comments List -->
    <div v-else class="space-y-4">
      <div
        v-for="comment in filteredComments"
        :key="comment.id"
        class="luxury-card hover:shadow-xl transition-shadow duration-300"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- User Info -->
            <div class="flex items-center gap-3 mb-3">
              <div class="w-12 h-12 bg-gradient-to-br from-luxury-purple to-luxury-rose rounded-full flex items-center justify-center text-white font-bold text-lg">
                {{ getInitial(comment.user_profiles?.display_name) }}
              </div>
              <div>
                <p class="font-semibold text-gray-900">
                  {{ comment.user_profiles?.display_name || '匿名用戶' }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ comment.user_profiles?.email }}
                </p>
              </div>
              <span
                :class="[
                  'ml-4 px-3 py-1 rounded-full text-sm font-semibold',
                  comment.status === 'pending' && 'bg-yellow-100 text-yellow-800',
                  comment.status === 'approved' && 'bg-green-100 text-green-800',
                  comment.status === 'rejected' && 'bg-red-100 text-red-800'
                ]"
              >
                {{ statusLabel[comment.status] }}
              </span>
            </div>

            <!-- Article Title -->
            <div class="mb-3 flex items-center text-sm text-gray-600">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              文章：<span class="font-medium text-luxury-purple ml-1">{{ comment.articles?.title }}</span>
            </div>

            <!-- Comment Content -->
            <div class="bg-gray-50 p-4 rounded-lg mb-3">
              <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {{ comment.content }}
              </p>
            </div>

            <!-- Timestamp -->
            <p class="text-sm text-gray-500">
              提交時間：{{ formatDate(comment.created_at) }}
            </p>
          </div>

          <!-- Actions -->
          <div class="ml-6 flex flex-col space-y-2">
            <button
              v-if="comment.status !== 'approved'"
              @click="updateStatus(comment.id, 'approved')"
              class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 flex items-center justify-center"
              title="批准"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              v-if="comment.status !== 'rejected'"
              @click="updateStatus(comment.id, 'rejected')"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center justify-center"
              title="拒絕"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              @click="deleteComment(comment.id)"
              class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 flex items-center justify-center"
              title="刪除"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredComments.length === 0" class="luxury-card text-center py-12">
        <div class="text-6xl mb-4">📭</div>
        <p class="text-gray-500 text-lg">
          {{ filterStatus === 'all' ? '尚無留言' : `尚無${statusLabel[filterStatus]}的留言` }}
        </p>
      </div>
    </div>

    <!-- Success message -->
    <div
      v-if="showSuccess"
      class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50"
    >
      ✓ {{ successMessage }}
    </div>

    <!-- Error message -->
    <div
      v-if="error"
      class="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50"
    >
      ✗ {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { commentsApi } from '../services/supabase'

const comments = ref([])
const loading = ref(true)
const filterStatus = ref('all')
const showSuccess = ref(false)
const successMessage = ref('')
const error = ref('')

const statusLabel = {
  all: '全部',
  pending: '待審核',
  approved: '已批准',
  rejected: '已拒絕'
}

const filteredComments = computed(() => {
  if (filterStatus.value === 'all') {
    return comments.value
  }
  return comments.value.filter(c => c.status === filterStatus.value)
})

const pendingCount = computed(() => 
  comments.value.filter(c => c.status === 'pending').length
)

const approvedCount = computed(() => 
  comments.value.filter(c => c.status === 'approved').length
)

const rejectedCount = computed(() => 
  comments.value.filter(c => c.status === 'rejected').length
)

onMounted(async () => {
  await loadComments()
})

async function loadComments() {
  loading.value = true
  try {
    console.log('開始載入評論...')
    const data = await commentsApi.getAll()
    console.log('載入的評論數據:', data)
    console.log('評論數量:', data?.length || 0)
    comments.value = data
  } catch (err) {
    console.error('載入留言失敗:', err)
    error.value = err.message || '載入失敗'
    setTimeout(() => error.value = '', 3000)
  } finally {
    loading.value = false
  }
}

async function updateStatus(commentId, status) {
  try {
    await commentsApi.updateStatus(commentId, status)
    
    const comment = comments.value.find(c => c.id === commentId)
    if (comment) {
      comment.status = status
    }
    
    successMessage.value = status === 'approved' ? '留言已批准' : '留言已拒絕'
    showSuccess.value = true
    setTimeout(() => showSuccess.value = false, 3000)
  } catch (err) {
    console.error('更新留言狀態失敗:', err)
    error.value = err.message || '操作失敗'
    setTimeout(() => error.value = '', 3000)
  }
}

async function deleteComment(commentId) {
  if (!confirm('確定要刪除這條留言嗎？')) return
  
  try {
    await commentsApi.delete(commentId)
    
    comments.value = comments.value.filter(c => c.id !== commentId)
    
    successMessage.value = '留言已刪除'
    showSuccess.value = true
    setTimeout(() => showSuccess.value = false, 3000)
  } catch (err) {
    console.error('刪除留言失敗:', err)
    error.value = err.message || '刪除失敗'
    setTimeout(() => error.value = '', 3000)
  }
}

function getCount(status) {
  if (status === 'all') return comments.value.length
  return comments.value.filter(c => c.status === status).length
}

function getInitial(name) {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
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
