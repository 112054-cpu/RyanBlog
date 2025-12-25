-- ============================================
-- 診斷評論 RLS 問題
-- ============================================

-- 1. 檢查所有評論
SELECT 
  id,
  article_id,
  user_id,
  LEFT(content, 50) as content_preview,
  status,
  created_at
FROM comments
ORDER BY created_at DESC;

-- 2. 檢查所有用戶及其角色
SELECT 
  id,
  email,
  display_name,
  role,
  created_at
FROM user_profiles
ORDER BY created_at;

-- 3. 檢查當前的 RLS 策略
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
WHERE tablename = 'comments';

-- 4. 檢查評論數量統計
SELECT 
  status,
  COUNT(*) as count
FROM comments
GROUP BY status;

-- 5. 檢查特定用戶的評論（替換為實際的 user_id）
-- SELECT * FROM comments WHERE user_id = 'YOUR_USER_ID_HERE';

-- 6. 測試管理員權限（需要在管理員登入的會話中執行）
-- SELECT 
--   c.*,
--   up.email,
--   up.display_name
-- FROM comments c
-- LEFT JOIN user_profiles up ON c.user_id = up.id
-- ORDER BY c.created_at DESC;
