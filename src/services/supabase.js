import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Supabase 配置檢查:')
console.log('URL 已設定:', !!supabaseUrl, supabaseUrl ? `(${supabaseUrl.substring(0, 30)}...)` : '(未設定)')
console.log('Key 已設定:', !!supabaseAnonKey, supabaseAnonKey ? `(${supabaseAnonKey.substring(0, 20)}...)` : '(未設定)')

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'your_supabase_project_url' || 
    supabaseUrl === 'https://your-project-id.supabase.co' ||
    supabaseAnonKey === 'your_supabase_anon_key' ||
    supabaseAnonKey === 'your-anon-key-here') {
  console.error('❌ Supabase 環境變數尚未配置！')
  console.error('📋 請按照以下步驟設置：')
  console.error('1. 前往 https://app.supabase.com 創建專案')
  console.error('2. 複製專案的 URL 和 API Key')
  console.error('3. 複製 .env.example 為 .env 並填入您的憑證')
  console.error('4. 重啟開發伺服器 (npm run dev)')
  console.error('')
  console.error('詳細說明請查看：SUPABASE_SETUP.md')
}

export const supabase = supabaseUrl && supabaseAnonKey ? 
  createClient(supabaseUrl, supabaseAnonKey) : 
  null

// Articles API
export const articlesApi = {
  // Get all articles
  async getAll() {
    if (!supabase) {
      throw new Error('Supabase 尚未配置，請檢查環境變數設置')
    }
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        photos (*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get single article
  async getById(id) {
    if (!supabase) {
      throw new Error('Supabase 尚未配置，請檢查環境變數設置')
    }
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        photos (*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create article
  async create(article) {
    if (!supabase) {
      throw new Error('Supabase 尚未配置，請檢查環境變數設置')
    }
    const { data, error } = await supabase
      .from('articles')
      .insert([article])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update article
  async update(id, article) {
    if (!supabase) {
      throw new Error('Supabase 尚未配置，請檢查環境變數設置')
    }
    const { data, error } = await supabase
      .from('articles')
      .update({ ...article, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete article
  async delete(id) {
    if (!supabase) {
      throw new Error('Supabase 尚未配置，請檢查環境變數設置')
    }
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Photos API
export const photosApi = {
  // Upload photo to storage
  async upload(file, articleId) {
    if (!supabase) {
      throw new Error('Supabase 尚未配置，請檢查環境變數設置')
    }
    const fileExt = file.name.split('.').pop()
    const fileName = `${articleId}/${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('article-photos')
      .upload(fileName, file)
    
    if (error) {
      console.error('照片上傳錯誤:', error)
      
      if (error.message.includes('Bucket not found')) {
        throw new Error('儲存空間未設置。請到 Supabase Dashboard > Storage 創建名為 "article-photos" 的公開 bucket')
      }
      
      throw new Error(`照片上傳失敗: ${error.message}`)
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('article-photos')
      .getPublicUrl(fileName)
    
    return publicUrl
  },

  // Add photo record to database
  async create(photo) {
    if (!supabase) {
      throw new Error('Supabase 尚未配置，請檢查環境變數設置')
    }
    const { data, error } = await supabase
      .from('photos')
      .insert([photo])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete photo
  async delete(id, url) {
    if (!supabase) {
      throw new Error('Supabase 尚未配置，請檢查環境變數設置')
    }
    // Delete from storage
    const path = url.split('/article-photos/')[1]
    if (path) {
      await supabase.storage
        .from('article-photos')
        .remove([path])
    }
    
    // Delete from database
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// User Profiles API
export const userProfilesApi = {
  // Get user profile by user ID
  async getById(userId) {
    if (!supabase) {
      throw new Error('Supabase 尚未配置，請檢查環境變數設置')
    }
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  // Get current user profile
  async getCurrent() {
    if (!supabase) {
      throw new Error('Supabase 尚未配置，請檢查環境變數設置')
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('未登入')
    
    return await this.getById(user.id)
  },

  // Update user profile
  async update(userId, updates) {
    if (!supabase) {
      throw new Error('Supabase 尚未配置，請檢查環境變數設置')
    }
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Comments API
export const commentsApi = {
  // Get approved comments for an article
  async getByArticleId(articleId) {
    if (!supabase) {
      throw new Error('Supabase 尚未配置，請檢查環境變數設置')
    }
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', articleId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('getByArticleId 錯誤:', error)
      throw error
    }
    
    // 補充用戶信息
    if (data && data.length > 0) {
      const commentsWithProfiles = await Promise.all(
        data.map(async (comment) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('display_name, email')
            .eq('id', comment.user_id)
            .single()
          return {
            ...comment,
            user_profiles: profile
          }
        })
      )
      return commentsWithProfiles
    }
    
    return data
  },

  // Get all comments (admin only)
  async getAll() {
    if (!supabase) {
      throw new Error('Supabase 尚未配置，請檢查環境變數設置')
    }
    
    // 獲取當前用戶信息
    const { data: { user } } = await supabase.auth.getUser()
    console.log('當前用戶:', user?.email, 'ID:', user?.id)
    
    // 檢查用戶角色
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      console.log('用戶角色:', profile?.role)
    }
    
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })
    
    console.log('查詢結果:', { data, error, count: data?.length || 0 })
    
    if (error) {
      console.error('查詢錯誤詳情:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      })
      throw error
    }
    
    // 如果成功獲取評論，再補充用戶信息
    if (data && data.length > 0) {
      console.log('成功獲取評論，正在補充用戶信息...')
      const commentsWithProfiles = await Promise.all(
        data.map(async (comment) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('display_name, email')
            .eq('id', comment.user_id)
            .single()
          return {
            ...comment,
            user_profiles: profile
          }
        })
      )
      return commentsWithProfiles
    }
    
    return data
  },

  // Get pending comments (admin only)
  async getPending() {
    if (!supabase) {
      throw new Error('Supabase 尚未配置，請檢查環境變數設置')
    }
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('getPending 錯誤詳情:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      })
      throw error
    }
    
    // 補充用戶信息
    if (data && data.length > 0) {
      const commentsWithProfiles = await Promise.all(
        data.map(async (comment) => {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('display_name, email')
            .eq('id', comment.user_id)
            .single()
          return {
            ...comment,
            user_profiles: profile
          }
        })
      )
      return commentsWithProfiles
    }
    
    return data
  },

  // Create comment
  async create(comment) {
    if (!supabase) {
      throw new Error('Supabase 尚未配置，請檢查環境變數設置')
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('請先登入才能留言')
    
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        ...comment,
        user_id: user.id,
        status: 'pending'
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update comment status (admin only)
  async updateStatus(commentId, status) {
    if (!supabase) {
      throw new Error('Supabase 尚未配置，請檢查環境變數設置')
    }
    const { data, error } = await supabase
      .from('comments')
      .update({ status })
      .eq('id', commentId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete comment (admin only)
  async delete(commentId) {
    if (!supabase) {
      throw new Error('Supabase 尚未配置，請檢查環境變數設置')
    }
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
    
    if (error) throw error
  }
}
