<template>
  <div class="max-w-4xl mx-auto">
    <div class="luxury-card">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-luxury-deepPurple font-playfair">
          {{ isEditing ? '編輯文章' : '撰寫新文章' }}
        </h1>
        
        <button @click="generateArticle" class="luxury-button-gold text-sm">
          ✨ 自動生成文章
        </button>
      </div>

      <form @submit.prevent="saveArticle" class="space-y-6">
        <!-- Title -->
        <div>
          <label class="block text-lg font-semibold text-gray-700 mb-2">
            文章標題 <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="form.title"
            type="text" 
            required
            class="w-full px-4 py-3 border-2 border-luxury-gold/30 rounded-lg focus:border-luxury-gold focus:outline-none transition-colors duration-300"
            placeholder="輸入文章標題..."
          />
        </div>

        <!-- Excerpt -->
        <div>
          <label class="block text-lg font-semibold text-gray-700 mb-2">
            文章摘要
          </label>
          <input 
            v-model="form.excerpt"
            type="text" 
            class="w-full px-4 py-3 border-2 border-luxury-gold/30 rounded-lg focus:border-luxury-gold focus:outline-none transition-colors duration-300"
            placeholder="簡短描述文章內容（選填）..."
          />
        </div>

        <!-- Content -->
        <div>
          <label class="block text-lg font-semibold text-gray-700 mb-2">
            文章內容 <span class="text-red-500">*</span>
          </label>
          <textarea 
            v-model="form.content"
            required
            rows="12"
            class="w-full px-4 py-3 border-2 border-luxury-gold/30 rounded-lg focus:border-luxury-gold focus:outline-none transition-colors duration-300 resize-y"
            placeholder="撰寫文章內容..."
          ></textarea>
        </div>

        <!-- Photos -->
        <PhotoUploader v-model="photos" />

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <!-- Actions -->
        <div class="flex space-x-4">
          <button 
            type="submit" 
            :disabled="saving"
            class="luxury-button flex-1"
          >
            {{ saving ? '儲存中...' : (isEditing ? '更新文章' : '發布文章') }}
          </button>
          
          <button 
            type="button"
            @click="cancel"
            class="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PhotoUploader from '../components/PhotoUploader.vue'
import { articlesApi, photosApi } from '../services/supabase'
import { generateArticle as generateArticleContent } from '../utils/articleGenerator'

export default {
  name: 'ArticleEditor',
  components: {
    PhotoUploader
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const isEditing = ref(false)
    const saving = ref(false)
    const error = ref('')

    const form = ref({
      title: '',
      excerpt: '',
      content: ''
    })

    const photos = ref([])

    const loadArticle = async () => {
      if (!route.params.id) return

      try {
        isEditing.value = true
        const article = await articlesApi.getById(route.params.id)
        
        form.value = {
          title: article.title,
          excerpt: article.excerpt || '',
          content: article.content
        }

        if (article.photos) {
          photos.value = article.photos.sort((a, b) => a.display_order - b.display_order)
        }
      } catch (err) {
        console.error('Error loading article:', err)
        error.value = '載入文章失敗'
      }
    }

    const generateArticle = () => {
      const generated = generateArticleContent()
      form.value.title = generated.title
      form.value.content = generated.content
      form.value.excerpt = generated.excerpt
    }

    const saveArticle = async () => {
      try {
        saving.value = true
        error.value = ''

        let articleId

        if (isEditing.value) {
          // Update existing article
          await articlesApi.update(route.params.id, {
            title: form.value.title,
            excerpt: form.value.excerpt,
            content: form.value.content
          })
          articleId = route.params.id
        } else {
          // Create new article
          const newArticle = await articlesApi.create({
            title: form.value.title,
            excerpt: form.value.excerpt,
            content: form.value.content
          })
          articleId = newArticle.id
        }

        // Upload new photos
        for (const photo of photos.value) {
          if (photo.file) {
            // Upload to storage
            const url = await photosApi.upload(photo.file, articleId)
            
            // Save to database
            await photosApi.create({
              article_id: articleId,
              url: url,
              display_order: photo.display_order
            })
          }
        }

        alert(isEditing.value ? '文章已更新' : '文章已發布')
        router.push(`/article/${articleId}`)
      } catch (err) {
        console.error('Error saving article:', err)
        error.value = '儲存失敗：' + err.message
      } finally {
        saving.value = false
      }
    }

    const cancel = () => {
      router.back()
    }

    onMounted(() => {
      loadArticle()
    })

    return {
      isEditing,
      saving,
      error,
      form,
      photos,
      generateArticle,
      saveArticle,
      cancel
    }
  }
}
</script>
