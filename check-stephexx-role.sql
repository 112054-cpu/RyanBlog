-- ============================================
-- 检查 stephexx@gmail.com 的用户状态
-- ============================================

-- 1. 查看该用户的完整信息
SELECT 
  up.id,
  up.email,
  up.display_name,
  up.role,
  up.created_at,
  au.created_at as auth_created_at
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.email = 'stephexx@gmail.com';

-- 2. 查看所有用户及其角色（按创建时间排序）
SELECT 
  email,
  display_name,
  role,
  created_at
FROM user_profiles
ORDER BY created_at;

-- 3. 如果 stephexx@gmail.com 的角色不是 'user'，手动修正
-- UPDATE user_profiles SET role = 'user' WHERE email = 'stephexx@gmail.com';

-- 4. 验证第一个用户是管理员
SELECT 
  email,
  role,
  created_at,
  CASE 
    WHEN created_at = (SELECT MIN(created_at) FROM user_profiles) THEN 'Should be admin'
    ELSE 'Should be user'
  END as expected_role
FROM user_profiles
ORDER BY created_at;

-- ============================================
-- 执行完毕后的操作：
-- ============================================
-- 1. 确认 stephexx@gmail.com 的 role 是 'user'
-- 2. 如果不是，取消注释上面的 UPDATE 语句并执行
-- 3. 然后在网站上：
--    - 登出
--    - 重新登入
--    - 刷新页面
-- ============================================
