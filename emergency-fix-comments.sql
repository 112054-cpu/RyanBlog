-- ============================================
-- 紧急修复：评论插入 RLS 策略
-- ============================================

-- 步骤 1：确保所有 auth.users 都有对应的 user_profiles
INSERT INTO public.user_profiles (id, email, display_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'display_name', split_part(au.email, '@', 1)) as display_name,
  CASE 
    WHEN au.created_at = (SELECT MIN(created_at) FROM auth.users) THEN 'admin'
    ELSE 'user'
  END as role
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;

-- 步骤 2：删除所有现有的 comments 表策略
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can view all comments" ON public.comments;
DROP POLICY IF EXISTS "Users can view own comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can update comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can delete comments" ON public.comments;

-- 步骤 3：创建最简单的插入策略（任何已认证用户都可以插入）
CREATE POLICY "Enable insert for authenticated users only"
  ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 步骤 4：重新创建查看策略
CREATE POLICY "Enable read for approved comments"
  ON public.comments
  FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

-- 步骤 5：管理员可以查看所有评论
CREATE POLICY "Enable admin to view all comments"
  ON public.comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 步骤 6：管理员可以更新评论
CREATE POLICY "Enable admin to update comments"
  ON public.comments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 步骤 7：管理员可以删除评论
CREATE POLICY "Enable admin to delete comments"
  ON public.comments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 步骤 8：验证设置
SELECT 'User profiles count:' as info, COUNT(*)::text as value FROM public.user_profiles
UNION ALL
SELECT 'Auth users count:', COUNT(*)::text FROM auth.users
UNION ALL
SELECT 'RLS policies count:', COUNT(*)::text FROM pg_policies WHERE tablename = 'comments';

-- 步骤 9：显示所有用户和角色
SELECT 
  email,
  display_name,
  role,
  created_at
FROM user_profiles
ORDER BY created_at;

-- ============================================
-- 完成！现在尝试在网站上提交评论
-- ============================================
-- 这个版本使用最宽松的插入策略
-- 任何已认证用户都可以插入评论
-- ============================================
