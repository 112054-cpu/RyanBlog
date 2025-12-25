import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'your_supabase_project_url' || 
    supabaseUrl === 'https://your-project-id.supabase.co' ||
    supabaseAnonKey === 'your_supabase_anon_key' ||
    supabaseAnonKey === 'your-anon-key-here') {
  
  const isProduction = import.meta.env.PROD
  const deploymentPlatform = window.location.hostname.includes('vercel.app') ? 'Vercel' : 
                             window.location.hostname.includes('netlify.app') ? 'Netlify' : 
                             '生產環境'
  
  console.error('❌ Supabase 環境變數尚未配置！')
  
  if (isProduction) {
    console.error(`\n📦 檢測到 ${deploymentPlatform} 部署環境`)
    console.error('🔧 請在部署平台設置環境變數：')
    console.error('   VITE_SUPABASE_URL = https://sefyuwnxedbcxmvalits.supabase.co')
    console.error('   VITE_SUPABASE_ANON_KEY = (從 Supabase Dashboard 複製)')
    console.error('')
    console.error(`📖 詳細步驟請查看：docs/VERCEL_DEPLOYMENT.md`)
  } else {
    console.error('\n📋 本地開發環境設置步驟：')
    console.error('1. 前往 https://app.supabase.com 創建專案')
    console.error('2. 複製專案的 URL 和 API Key')
    console.error('3. 複製 .env.example 為 .env 並填入您的憑證')
    console.error('4. 重啟開發伺服器 (npm run dev)')
    console.error('')
    console.error('📖 詳細說明請查看：docs/SUPABASE_SETUP.md')
  }
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
    
    // 批量獲取用戶信息（優化版）
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(c => c.user_id))]
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, display_name, email')
        .in('id', userIds)
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
      
      return data.map(comment => ({
        ...comment,
        user_profiles: profileMap.get(comment.user_id)
      }))
    }
    
    return data
  },

  // Get all comments (admin only)
  async getAll() {
    if (!supabase) {
      throw new Error('Supabase 尚未配置，請檢查環境變數設置')
    }
    
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('查詢錯誤詳情:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw error
    }
    
    // 批量獲取用戶信息（優化版）
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(c => c.user_id))]
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, display_name, email')
        .in('id', userIds)
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
      
      return data.map(comment => ({
        ...comment,
        user_profiles: profileMap.get(comment.user_id)
      }))
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
        code: error.code
      })
      throw error
    }
    
    // 批量獲取用戶信息（優化版）
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(c => c.user_id))]
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, display_name, email')
        .in('id', userIds)
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
      
      return data.map(comment => ({
        ...comment,
        user_profiles: profileMap.get(comment.user_id)
      }))
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
