<template>
  <footer class="bg-gradient-to-r from-luxury-deepPurple via-luxury-purple to-luxury-deepPurple mt-16 py-12">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
        <div class="space-y-4">
          <h3 class="text-2xl font-playfair font-bold text-luxury-gold">Ryan's Blog</h3>
          <p class="text-gray-200">
            分享生活、記錄美好，用華麗的視角看世界
          </p>
        </div>
        
        <div class="space-y-4">
          <h4 class="text-xl font-playfair font-semibold">快速連結</h4>
          <ul class="space-y-2">
            <li>
              <router-link to="/" class="hover:text-luxury-gold transition-colors duration-300">
                首頁
              </router-link>
            </li>
            <li>
              <router-link to="/login" class="hover:text-luxury-gold transition-colors duration-300">
                管理後台
              </router-link>
            </li>
          </ul>
        </div>
        
        <div class="space-y-4">
          <h4 class="text-xl font-playfair font-semibold">關於</h4>
          <p class="text-gray-200">
            採用 Vue.js + Supabase 構建<br>
            華麗設計 • 極致體驗
          </p>
        </div>
      </div>
      
      <div class="mt-8 pt-8 border-t border-luxury-gold/30 text-center text-gray-200">
        <p>&copy; {{ currentYear }} Ryan's Blog. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'Footer',
  setup() {
    const currentYear = computed(() => new Date().getFullYear())
    
    return {
      currentYear
    }
  }
}
</script>
