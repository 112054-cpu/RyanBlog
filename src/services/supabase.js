import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'your_supabase_project_url' || 
    supabaseUrl === 'https://your-project-id.supabase.co' ||
    supabaseAnonKey === 'your_supabase_anon_key' ||
    supabaseAnonKey === 'your-anon-key-here') {
  coif (!supabase) {
      throw new Error('Supabase 尚未配置，請檢查環境變數設置')
    }
    nsole.error('❌ Supabase 環境變數尚未配置！')
  console.error('📋 請按照以下步驟設置：')
  console.error('1. 前往 https://app.supabase.com 創建專案')
  console.error('2. 複製專案的 URL 和 API Key')
  console.error('3. 編輯 .env 文件，填入您的憑證')
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
    const fileExt = file.name.split('.').pop()
    const fileName = `${articleId}/${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('article-photos')
      .upload(fileName, file)
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('article-photos')
      .getPublicUrl(fileName)
    
    return publicUrl
  },

  // Add photo record to database
  async create(photo) {
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
