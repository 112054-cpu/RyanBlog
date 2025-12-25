// Auth utilities for secure authentication
import { supabase } from '../services/supabase'

export const authUtils = {
  // 檢查用戶是否已登入
  async isAuthenticated() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return !!session
    } catch (error) {
      console.error('Auth check error:', error)
      return false
    }
  },

  // 獲取當前用戶
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  },

  // 登出
  async signOut() {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('supabase_token')
      window.dispatchEvent(new Event('storage'))
    } catch (error) {
      console.error('Sign out error:', error)
    }
  },

  // 驗證 token 是否有效
  async validateToken() {
    const token = localStorage.getItem('supabase_token')
    if (!token) return false

    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        // Token 無效，清除本地存儲
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('supabase_token')
        return false
      }
      return true
    } catch (error) {
      console.error('Token validation error:', error)
      return false
    }
  }
}
