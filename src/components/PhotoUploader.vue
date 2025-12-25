<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-xl font-playfair font-bold text-luxury-deepPurple">
          文章照片 ({{ photos.length }}/10)
        </h3>
        <p class="text-sm text-gray-500 mt-1">
          支援 JPG、PNG、WebP、GIF、BMP，自動轉為 JPG 並壓縮至 1MB 以下
        </p>
        <p class="text-xs text-gray-400 mt-1">
          💡 iPhone 用戶建議：設定 > 相機 > 格式 > 選擇「最兼容」可避免格式問題
        </p>
      </div>
      
      <label 
        v-if="photos.length < 10"
        class="luxury-button-gold cursor-pointer text-sm"
      >
        <input 
          type="file" 
          accept="image/*" 
          multiple 
          class="hidden" 
          @change="handleFileSelect"
        />
        📷 上傳照片
      </label>
    </div>

    <div v-if="uploading" class="text-center py-4">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-luxury-gold border-t-transparent"></div>
      <p class="mt-2 text-gray-600">正在轉換為 JPG 並壓縮至 1MB 以下...</p>
      <p class="text-sm text-gray-500">{{ uploadProgress }}</p>
    </div>

    <div v-if="error" class="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-4 rounded-lg space-y-2">
      <div class="flex items-start">
        <span class="text-xl mr-2">⚠️</span>
        <div class="flex-1">
          <p class="font-semibold mb-1">上傳失敗</p>
          <p class="text-sm">{{ error }}</p>
        </div>
        <button @click="error = ''" class="text-red-600 hover:text-red-800 ml-2">✕</button>
      </div>
      <div v-if="error.includes('HEIC')" class="bg-white/50 p-3 rounded text-xs space-y-1">
        <p class="font-semibold">💡 解決方法：</p>
        <p>1. 在 iPhone 開啟「設定」→「相機」→「格式」</p>
        <p>2. 選擇「最兼容」（會改為 JPG 格式）</p>
        <p>3. 或使用其他圖片編輯 App 先轉為 JPG</p>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div 
        v-for="(photo, index) in photos" 
        :key="photo.id || index"
        class="relative group"
      >
        <img 
          :src="photo.url" 
          :alt="`Photo ${index + 1}`"
          class="w-full h-32 object-cover rounded-lg luxury-border"
        />
        
        <button
          @click="removePhoto(index)"
          class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
        >
          ✕
        </button>
        
        <div class="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          順序 {{ index + 1 }}
        </div>
        
        <div v-if="photo.file" class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
          JPG
        </div>
      </div>
    </div>

    <p v-if="photos.length === 0" class="text-center text-gray-400 py-8">
      尚未上傳照片<br>
      <span class="text-xs">支援 JPG、PNG、WebP、GIF、BMP 等格式</span><br>
      <span class="text-xs text-gray-400 mt-1">iPhone 用戶請使用「最兼容」格式拍照</span>
    </p>
  </div>
</template>

<script>
import { ref } from 'vue'
import { compressImage, validateImageFile } from '../utils/imageCompression'

export default {
  name: 'PhotoUploader',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const photos = ref(props.modelValue || [])
    const uploading = ref(false)
    const error = ref('')
    const uploadProgress = ref('')

    const handleFileSelect = async (event) => {
      const files = Array.from(event.target.files)
      
      if (photos.value.length + files.length > 10) {
        error.value = '每篇文章最多只能上傳 10 張照片'
        return
      }

      uploading.value = true
      error.value = ''

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          uploadProgress.value = `處理第 ${i + 1} / ${files.length} 張圖片...`
          
          // Validate file
          validateImageFile(file)
          
          // Compress and convert to JPG
          const compressedFile = await compressImage(file)
          
          // Create preview URL
          const url = URL.createObjectURL(compressedFile)
          
          photos.value.push({
            url,
            file: compressedFile,
            display_order: photos.value.length
          })
        }
        
        uploadProgress.value = '完成！'
        emit('update:modelValue', photos.value)
      } catch (err) {
        error.value = err.message
      } finally {
        uploading.value = false
        event.target.value = ''
      }
    }

    const removePhoto = (index) => {
      photos.value.splice(index, 1)
      // Update display order
      photos.value.forEach((photo, idx) => {
        photo.display_order = idx
      })
      emit('update:modelValue', photos.value)
    }

    return {
      photos,
      uploading,
      error,
      uploadProgress,
      handleFileSelect,
      removePhoto
    }
  }
}
</script>
