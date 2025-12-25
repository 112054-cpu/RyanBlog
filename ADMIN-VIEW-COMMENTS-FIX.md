# 管理員看不到待審核評論 - 診斷與修復

## 問題描述

✅ 普通用戶可以成功提交評論
❌ 管理員登入 `/comments` 頁面看不到任何待審核的評論

## 診斷步驟

### 1. 檢查瀏覽器控制台

1. 用管理員帳號登入
2. 進入 `/comments` 頁面
3. 打開瀏覽器開發者工具 (F12 或 Cmd + Option + I)
4. 查看 Console 標籤，應該看到：
   ```
   開始載入評論...
   當前用戶: your-admin-email@example.com ID: xxx-xxx-xxx
   用戶角色: admin
   查詢結果: { data: [...], error: null, count: X }
   載入的評論數據: [...]
   評論數量: X
   ```

### 2. 在 Supabase 執行診斷查詢

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇項目 → SQL Editor → New query
3. 複製 `debug-comments-rls.sql` 的內容並執行
4. 查看結果：
   - 確認評論表中有數據
   - 確認用戶的 role 是 'admin'
   - 確認 RLS 策略存在

## 可能的原因與解決方案

### 原因 1: RLS 策略沒有正確應用

**症狀**: 控制台顯示 `查詢結果: { data: [], count: 0 }` 但數據庫中有評論

**解決方案**: 執行 `fix-admin-view-comments.sql`

```bash
# 在 Supabase SQL Editor 執行此腳本
```

### 原因 2: 管理員用戶的 role 不是 'admin'

**症狀**: 控制台顯示 `用戶角色: user` 或 `null`

**解決方案**: 在 Supabase SQL Editor 執行

```sql
-- 檢查管理員的 role
SELECT email, role FROM user_profiles;

-- 如果 role 不是 admin，手動更新
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

### 原因 3: 評論確實不存在

**症狀**: 數據庫查詢顯示 comments 表為空

**解決方案**:

1. 用普通用戶重新提交一條測試評論
2. 在 Supabase → Table Editor → comments 查看是否有新記錄
3. 確認記錄的 status 是 'pending'

### 原因 4: 前端權限檢查問題

**症狀**: 頁面重定向或顯示權限錯誤

**解決方案**: 檢查 router/index.js 的 beforeEach guard

```javascript
// 確認 isAdmin() 函數正常工作
console.log("isAdmin:", await authUtils.isAdmin());
```

## 快速修復流程

### 步驟 1: 執行補充修復腳本

在 Supabase SQL Editor 執行 `fix-admin-view-comments.sql`

### 步驟 2: 驗證數據庫狀態

```sql
-- 查看所有評論
SELECT * FROM comments;

-- 查看管理員信息
SELECT * FROM user_profiles WHERE role = 'admin';

-- 查看 RLS 策略
SELECT * FROM pg_policies WHERE tablename = 'comments';
```

### 步驟 3: 清除緩存並重新登入

1. 在網站上登出
2. 清除瀏覽器緩存（Cmd + Shift + Delete）
3. 關閉所有該網站的標籤
4. 重新打開瀏覽器
5. 用管理員帳號登入
6. 進入 `/comments` 頁面

### 步驟 4: 檢查控制台輸出

查看新增的調試信息，確認：

- ✅ 當前用戶 ID 正確
- ✅ 用戶角色是 'admin'
- ✅ 查詢返回了數據
- ✅ data 數組不為空

## 臨時繞過 RLS（僅用於測試）

如果以上方法都不行，可以臨時禁用 RLS 來確認問題：

```sql
-- ⚠️ 僅用於測試！
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;

-- 測試完成後必須重新啟用
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
```

如果禁用 RLS 後可以看到評論，說明問題確實在 RLS 策略上。

## 終極解決方案：Service Role Key

如果 RLS 策略確實有問題，可以在管理後台使用 Service Role Key 繞過 RLS：

### 1. 在 .env 中添加

```env
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. 修改 supabase.js

```javascript
// 創建管理員專用的 Supabase 客戶端
export const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
)

// 在 commentsApi 中添加管理員專用方法
async getAllAsAdmin() {
  const { data, error } = await supabaseAdmin
    .from('comments')
    .select('*, user_profiles(*), articles(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

### 3. 修改 CommentModeration.vue

```javascript
// 檢查是否為管理員，使用不同的 API
const isAdmin = await authUtils.isAdmin();
if (isAdmin) {
  comments.value = await commentsApi.getAllAsAdmin();
} else {
  comments.value = await commentsApi.getAll();
}
```

⚠️ **注意**: Service Role Key 可以繞過所有 RLS 策略，不要暴露在前端代碼中！只在服務器端或管理後台使用。

## 預期結果

修復後，管理員登入 `/comments` 應該看到：

- ✅ 所有評論（pending、approved、rejected）
- ✅ 正確的統計數字
- ✅ 可以批准/拒絕/刪除評論

## 需要更多幫助？

如果問題仍未解決，請提供：

1. 瀏覽器控制台的完整輸出（截圖）
2. Supabase SQL Editor 執行 `debug-comments-rls.sql` 的結果
3. 管理員的 email
4. 評論是否在 Supabase Table Editor 中可見

---

最後更新: 2024-12-25
