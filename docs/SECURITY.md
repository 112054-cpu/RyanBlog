# 🔒 安全設置指南

本專案已實施多層安全防護，以下是設置步驟：

## 1. 創建管理員帳號

在 Supabase Dashboard 創建管理員帳號：

```sql
-- 在 SQL Editor 執行
-- 注意：這會創建一個測試用戶，請設置強密碼
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@ryanblog.local',
  crypt('YOUR_STRONG_PASSWORD', gen_salt('bf')),
  now(),
  now(),
  now()
);
```

或使用 Supabase Auth API：

```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/auth/v1/signup' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@ryanblog.local",
    "password": "YOUR_STRONG_PASSWORD"
  }'
```

## 2. 更新 Row Level Security 政策

在 Supabase SQL Editor 執行：

```sql
-- 刪除舊的公開寫入政策
DROP POLICY IF EXISTS "Allow public insert" ON articles;
DROP POLICY IF EXISTS "Allow public update" ON articles;
DROP POLICY IF EXISTS "Allow public delete" ON articles;
DROP POLICY IF EXISTS "Enable insert access for all users" ON photos;
DROP POLICY IF EXISTS "Enable update access for all users" ON photos;
DROP POLICY IF EXISTS "Enable delete access for all users" ON photos;

-- 創建新的認證用戶政策
CREATE POLICY "Authenticated users can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert photos"
  ON photos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update photos"
  ON photos FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete photos"
  ON photos FOR DELETE
  TO authenticated
  USING (true);
```

## 3. 設置 Storage Bucket 權限

```sql
-- 只允許認證用戶上傳檔案
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'article-photos');

CREATE POLICY "Authenticated users can update files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'article-photos');

CREATE POLICY "Authenticated users can delete files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'article-photos');

-- 保持公開讀取
CREATE POLICY "Public can view files"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'article-photos');
```

## 4. 環境變數安全

確保 `.env` 檔案已在 `.gitignore` 中：

```bash
# 檢查
cat .gitignore | grep .env
```

Netlify 環境變數設置：

1. 進入 Site settings → Environment variables
2. 確認已設置：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **不要**將這些值提交到 Git

## 5. 已實施的安全措施

### ✅ XSS 防護

- 使用 `DOMPurify` 清理所有 HTML 輸出
- Markdown 渲染經過嚴格過濾

### ✅ CSRF 防護

- 使用 Supabase Auth tokens
- 每個請求都需要有效的 session

### ✅ 安全標頭

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Content Security Policy (CSP)
- Referrer-Policy: strict-origin-when-cross-origin

### ✅ 認證安全

- 使用 Supabase Auth（行業標準）
- JWT tokens 自動管理
- Session 自動過期

### ✅ 資料庫安全

- Row Level Security (RLS) 啟用
- 只有認證用戶可以修改資料
- 公開讀取，私有寫入

### ✅ 圖片安全

- 自動轉換為 JPG
- 壓縮至 1MB 以下
- 驗證檔案類型

## 6. 定期維護

- 每月執行 `npm audit` 檢查漏洞
- 更新依賴套件：`npm update`
- 定期備份 Supabase 資料庫
- 監控 Supabase Auth logs

## 7. 測試安全設置

登入測試：

1. 前往 `/admin` 頁面
2. 使用創建的管理員帳號登入
3. 確認可以創建/編輯/刪除文章

## 注意事項

⚠️ **重要**：

- 請務必更改預設密碼
- 不要在前端代碼中硬編碼任何密碼
- 定期輪換 API keys
- 啟用 Supabase 的 2FA（如果可用）

## 緊急聯絡

如發現安全漏洞，請立即：

1. 在 Supabase 中禁用受影響的 API keys
2. 更改所有密碼
3. 檢查 Supabase logs 是否有異常活動
