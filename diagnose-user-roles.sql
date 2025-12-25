-- ============================================
-- 诊断和修复用户角色
-- ============================================

-- 1. 查看所有用户及其角色
SELECT 
  up.id,
  up.email,
  up.display_name,
  up.role,
  up.created_at,
  au.created_at as auth_created_at
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
ORDER BY au.created_at;

-- 2. 查看哪些 auth.users 没有 user_profiles
SELECT 
  au.id,
  au.email,
  au.created_at,
  'Missing user_profile!' as status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- 3. 为缺失的用户创建 user_profiles
-- 第一个用户设为 admin，其他为 user
INSERT INTO user_profiles (id, email, display_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'display_name', split_part(au.email, '@', 1)) as display_name,
  CASE 
    WHEN au.created_at = (SELECT MIN(created_at) FROM auth.users) THEN 'admin'
    ELSE 'user'
  END as role
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- 4. 如果需要手动设置某个用户为管理员
-- 取消注释下面的行，并替换邮箱
-- UPDATE user_profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';

-- 5. 如果需要手动设置某个用户为普通用户
-- 取消注释下面的行，并替换邮箱
-- UPDATE user_profiles SET role = 'user' WHERE email = 'stephexx@gmail.com';

-- 6. 查看评论权限测试
SELECT 
  'Comments table exists' as status,
  COUNT(*) as comment_count
FROM comments;

-- 7. 验证 RLS 策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('user_profiles', 'comments')
ORDER BY tablename, policyname;

-- ============================================
-- 完成！检查输出结果
-- ============================================
