-- ============================================
-- 補充修復：確保管理員可以查看所有評論
-- ============================================

-- 檢查當前策略
SELECT 
  policyname,
  cmd,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'comments' AND cmd = 'SELECT';

-- 刪除舊的 SELECT 策略
DROP POLICY IF EXISTS "public_read_approved" ON public.comments;
DROP POLICY IF EXISTS "users_read_own" ON public.comments;
DROP POLICY IF EXISTS "admin_read_all" ON public.comments;

-- 重新創建更清晰的 SELECT 策略

-- 1. 公開：所有人可以看到已批准的評論
CREATE POLICY "select_approved_comments"
  ON public.comments
  FOR SELECT
  USING (status = 'approved');

-- 2. 用戶：可以看到自己的所有評論
CREATE POLICY "select_own_comments"
  ON public.comments
  FOR SELECT
  USING (auth.uid() = user_id);

-- 3. 管理員：可以看到所有評論（最優先）
CREATE POLICY "select_all_comments_admin"
  ON public.comments
  FOR SELECT
  USING (
    -- 檢查當前用戶是否為管理員
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- 驗證策略
SELECT 
  policyname as "策略名稱",
  cmd as "操作",
  CASE 
    WHEN policyname LIKE '%admin%' THEN '✅ 管理員策略'
    WHEN policyname LIKE '%own%' THEN '👤 用戶自己'
    WHEN policyname LIKE '%approved%' THEN '🌍 公開已批准'
    ELSE '其他'
  END as "類型"
FROM pg_policies 
WHERE tablename = 'comments' AND cmd = 'SELECT'
ORDER BY policyname;

-- 測試查詢（以管理員身份執行應該看到所有評論）
SELECT 
  c.id,
  c.status,
  c.created_at,
  LEFT(c.content, 30) as content_preview,
  up.email as user_email,
  up.role as user_role
FROM comments c
LEFT JOIN user_profiles up ON c.user_id = up.id
ORDER BY c.created_at DESC
LIMIT 10;
