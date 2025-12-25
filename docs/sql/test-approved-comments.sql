-- 測試已批准的評論是否可見

-- 1. 查看所有評論及其狀態
SELECT 
  c.id,
  c.article_id,
  c.status,
  LEFT(c.content, 40) as content_preview,
  up.email as user_email,
  up.display_name,
  c.created_at
FROM comments c
LEFT JOIN user_profiles up ON c.user_id = up.id
ORDER BY c.created_at DESC;

-- 2. 統計各狀態的評論數量
SELECT 
  status,
  COUNT(*) as count
FROM comments
GROUP BY status;

-- 3. 查看特定文章的已批准評論（替換 YOUR_ARTICLE_ID）
-- SELECT 
--   c.*,
--   up.display_name,
--   up.email
-- FROM comments c
-- LEFT JOIN user_profiles up ON c.user_id = up.id
-- WHERE c.article_id = 'YOUR_ARTICLE_ID' 
--   AND c.status = 'approved'
-- ORDER BY c.created_at ASC;

-- 4. 測試批准一條評論（替換 YOUR_COMMENT_ID）
-- UPDATE comments 
-- SET status = 'approved' 
-- WHERE id = 'YOUR_COMMENT_ID';

-- 5. 驗證 RLS 策略 - 公開查詢應該只返回 approved 評論
-- 這個查詢模擬前端未登入用戶看到的內容
SELECT 
  COUNT(*) as approved_visible_count
FROM comments
WHERE status = 'approved';
