-- ============================================
-- 最终修复：彻底解决评论 RLS 问题
-- ============================================
-- 执行此脚本前，请确保已登录到 Supabase SQL Editor

-- 第一步：确保所有用户都有 user_profiles
DO $$
BEGIN
  -- 为所有 auth.users 创建 user_profiles
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
  
  RAISE NOTICE 'Step 1 完成: user_profiles 已同步';
END $$;

-- 第二步：暂时禁用 RLS 以清理
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;

-- 第三步：删除所有现有策略
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can view all comments" ON public.comments;
DROP POLICY IF EXISTS "Users can view own comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can update comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can delete comments" ON public.comments;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.comments;
DROP POLICY IF EXISTS "Enable read for approved comments" ON public.comments;
DROP POLICY IF EXISTS "Enable admin to view all comments" ON public.comments;
DROP POLICY IF EXISTS "Enable admin to update comments" ON public.comments;
DROP POLICY IF EXISTS "Enable admin to delete comments" ON public.comments;

-- 第四步：重新启用 RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 第五步：创建最简单、最宽松的策略

-- 5.1 任何人都可以查看已批准的评论
CREATE POLICY "public_read_approved"
  ON public.comments
  FOR SELECT
  USING (status = 'approved');

-- 5.2 用户可以查看自己的评论（无论状态）
CREATE POLICY "users_read_own"
  ON public.comments
  FOR SELECT
  USING (auth.uid() = user_id);

-- 5.3 管理员可以查看所有评论
CREATE POLICY "admin_read_all"
  ON public.comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 5.4 已认证用户可以插入评论（最简单版本）
CREATE POLICY "authenticated_insert"
  ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- 只检查是否已认证和 user_id 匹配当前用户
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
    -- 确保 user_profiles 存在
    AND EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid()
    )
  );

-- 5.5 管理员可以更新评论
CREATE POLICY "admin_update"
  ON public.comments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- 5.6 管理员可以删除评论
CREATE POLICY "admin_delete"
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

-- 第六步：验证设置
DO $$
DECLARE
  user_count INT;
  profile_count INT;
  policy_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM auth.users;
  SELECT COUNT(*) INTO profile_count FROM public.user_profiles;
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'comments';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '验证结果:';
  RAISE NOTICE 'auth.users 数量: %', user_count;
  RAISE NOTICE 'user_profiles 数量: %', profile_count;
  RAISE NOTICE 'comments RLS 策略数量: %', policy_count;
  
  IF user_count = profile_count THEN
    RAISE NOTICE '✅ 所有用户都有 user_profile';
  ELSE
    RAISE WARNING '⚠️  user_profiles 数量不匹配！';
  END IF;
  
  IF policy_count = 6 THEN
    RAISE NOTICE '✅ RLS 策略已正确创建';
  ELSE
    RAISE WARNING '⚠️  RLS 策略数量异常: 期望 6，实际 %', policy_count;
  END IF;
  RAISE NOTICE '========================================';
END $$;

-- 第七步：显示所有用户及其角色
SELECT 
  email,
  display_name,
  role,
  created_at
FROM user_profiles
ORDER BY created_at;

-- 第八步：显示所有 RLS 策略
SELECT 
  policyname as "策略名称",
  cmd as "操作",
  roles as "角色",
  CASE 
    WHEN qual IS NOT NULL THEN '有 USING 子句'
    ELSE '无 USING 子句'
  END as "USING",
  CASE 
    WHEN with_check IS NOT NULL THEN '有 WITH CHECK 子句'
    ELSE '无 WITH CHECK 子句'
  END as "WITH_CHECK"
FROM pg_policies 
WHERE tablename = 'comments'
ORDER BY cmd, policyname;

-- ============================================
-- 完成！
-- ============================================
-- 现在：
-- 1. 在网站上登出
-- 2. 重新登入
-- 3. 尝试提交评论
-- 4. 应该可以成功了！
-- ============================================
