-- ============================================
-- 修复评论系统 RLS 策略
-- ============================================

-- 1. 首先，为现有已认证的用户创建 user_profiles（如果不存在）
INSERT INTO public.user_profiles (id, email, display_name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1)),
  CASE 
    WHEN email IN (
      SELECT email FROM auth.users ORDER BY created_at LIMIT 1
    ) THEN 'admin'
    ELSE 'user'
  END as role
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;

-- 2. 删除旧的 comments 表 RLS 策略
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can view all comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can update comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can delete comments" ON public.comments;

-- 3. 创建新的、更宽松的策略

-- 3.1 所有人可以查看已批准的评论
CREATE POLICY "Anyone can view approved comments" 
  ON public.comments FOR SELECT 
  USING (status = 'approved');

-- 3.2 管理员可以查看所有评论
CREATE POLICY "Admins can view all comments" 
  ON public.comments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3.3 已认证用户可以查看自己的评论
CREATE POLICY "Users can view own comments" 
  ON public.comments FOR SELECT 
  USING (auth.uid() = user_id);

-- 3.4 已认证用户可以插入评论（简化版本）
CREATE POLICY "Authenticated users can insert comments" 
  ON public.comments FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3.5 管理员可以更新评论
CREATE POLICY "Admins can update comments" 
  ON public.comments FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3.6 管理员可以删除评论
CREATE POLICY "Admins can delete comments" 
  ON public.comments FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. 验证设置
SELECT 'RLS 策略已更新' as status;
SELECT 'user_profiles 记录数: ' || COUNT(*)::text as user_profiles_count FROM public.user_profiles;
SELECT 'auth.users 记录数: ' || COUNT(*)::text as auth_users_count FROM auth.users;

-- ============================================
-- 完成！
-- ============================================
-- 现在尝试重新提交评论
-- ============================================
