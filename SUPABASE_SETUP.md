# Supabase 數據庫設置 SQL 腳本

## 快速複製貼上版本

在 Supabase SQL Editor 中執行以下完整腳本：

```sql
-- =============================================
-- Ryan's Blog Database Setup
-- =============================================

-- 1. 創建文章表
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 創建照片表
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 創建索引以提升查詢性能
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_photos_article_id ON photos(article_id);
CREATE INDEX idx_photos_display_order ON photos(article_id, display_order);

-- 4. 啟用 Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- 5. 文章表 RLS 策略
CREATE POLICY "Allow public read access on articles"
  ON articles FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on articles"
  ON articles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on articles"
  ON articles FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete on articles"
  ON articles FOR DELETE
  USING (true);

-- 6. 照片表 RLS 策略
CREATE POLICY "Allow public read access on photos"
  ON photos FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on photos"
  ON photos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public delete on photos"
  ON photos FOR DELETE
  USING (true);

-- 7. 創建更新時間自動更新的觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Storage Bucket 設置

### 1. 創建 Bucket
- 名稱: `article-photos`
- 類型: Public bucket
- 允許的文件類型: image/jpeg, image/png, image/webp

### 2. Storage Policies（在 Storage > article-photos > Policies 中執行）

```sql
-- 允許公開讀取
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'article-photos');

-- 允許公開上傳
CREATE POLICY "Allow public upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'article-photos');

-- 允許公開刪除
CREATE POLICY "Allow public delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'article-photos');

-- 允許公開更新
CREATE POLICY "Allow public update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'article-photos');
```

## 驗證設置是否成功

在 SQL Editor 中執行：

```sql
-- 檢查表是否創建成功
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('articles', 'photos');

-- 檢查 RLS 是否啟用
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('articles', 'photos');

-- 檢查策略是否存在
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('articles', 'photos');
```

預期結果：
- 應該看到 `articles` 和 `photos` 兩個表
- `rowsecurity` 應該為 `true`
- 應該看到多個策略（每個表至少 3-4 個）

## 插入測試數據（可選）

```sql
-- 插入測試文章
INSERT INTO articles (title, content, excerpt)
VALUES 
  (
    '歡迎來到 Ryan''s Blog',
    '這是我的第一篇文章！在這裡，我將分享生活、技術和各種有趣的內容。期待與大家一起成長。',
    '歡迎來到我的部落格，這裡將分享生活與技術的點滴。'
  ),
  (
    '探索 Vue.js 的魅力',
    'Vue.js 是一個漸進式的 JavaScript 框架，它讓前端開發變得更加優雅和高效。今天讓我們一起探索它的強大功能。',
    'Vue.js 讓前端開發變得更優雅，讓我們一起探索它的魅力。'
  );

-- 驗證插入成功
SELECT id, title, created_at FROM articles ORDER BY created_at DESC;
```

## 獲取 Supabase 憑證

1. 進入 Supabase 專案
2. 點擊左側齒輪圖示（Settings）
3. 點擊 "API"
4. 複製以下內容到 `.env` 檔案：

```env
VITE_SUPABASE_URL=<Project URL>
VITE_SUPABASE_ANON_KEY=<anon public key>
```

## 故障排除

### 問題：無法讀取文章
```sql
-- 檢查 RLS 策略
SELECT * FROM pg_policies WHERE tablename = 'articles';

-- 如果策略不存在，重新創建
DROP POLICY IF EXISTS "Allow public read access on articles" ON articles;
CREATE POLICY "Allow public read access on articles"
  ON articles FOR SELECT
  USING (true);
```

### 問題：無法上傳照片到 Storage
1. 確認 bucket 名稱是 `article-photos`
2. 確認 bucket 是 public
3. 重新設置 Storage policies

### 問題：照片 URL 無法訪問
1. 確認 bucket 設置為 Public
2. 檢查 Storage 中是否有文件
3. 使用正確的 URL 格式：`https://<project-id>.supabase.co/storage/v1/object/public/article-photos/<file-path>`

## 安全性建議（生產環境）

如果要在生產環境中使用，建議修改 RLS 策略以要求認證：

```sql
-- 刪除公開寫入策略
DROP POLICY "Allow public insert on articles" ON articles;
DROP POLICY "Allow public update on articles" ON articles;
DROP POLICY "Allow public delete on articles" ON articles;

-- 創建需要認證的策略
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
```

然後在應用中整合 Supabase Auth 進行用戶認證。
