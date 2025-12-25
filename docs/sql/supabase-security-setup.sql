-- 🔐 Ryan Blog 安全設置 SQL 腳本
-- 在 Supabase SQL Editor 執行此腳本

-- ========================================
-- 1. 創建管理員帳號
-- ========================================
-- 請將 'YOUR_STRONG_PASSWORD' 替換為強密碼（至少 12 個字符）

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@ryanblog.local',
  crypt('YOUR_STRONG_PASSWORD', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- ========================================
-- 2. 更新 Articles 表的 RLS 政策
-- ========================================

-- 刪除舊的公開寫入政策
DROP POLICY IF EXISTS "Allow public insert" ON articles;
DROP POLICY IF EXISTS "Allow public update" ON articles;
DROP POLICY IF EXISTS "Allow public delete" ON articles;
DROP POLICY IF EXISTS "Enable insert access for all users" ON articles;
DROP POLICY IF EXISTS "Enable update access for all users" ON articles;

-- 保留公開讀取
DROP POLICY IF EXISTS "Allow public read access" ON articles;
CREATE POLICY "Public can view articles" 
  ON articles FOR SELECT 
  TO public
  USING (true);

-- 只允許認證用戶修改
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

-- ========================================
-- 3. 更新 Photos 表的 RLS 政策
-- ========================================

-- 刪除舊的公開寫入政策
DROP POLICY IF EXISTS "Allow public insert" ON photos;
DROP POLICY IF EXISTS "Allow public delete" ON photos;
DROP POLICY IF EXISTS "Enable insert access for all users" ON photos;
DROP POLICY IF EXISTS "Enable update access for all users" ON photos;
DROP POLICY IF EXISTS "Enable delete access for all users" ON photos;

-- 保留公開讀取
DROP POLICY IF EXISTS "Allow public read access" ON photos;
DROP POLICY IF EXISTS "Enable read access for all users" ON photos;
CREATE POLICY "Public can view photos" 
  ON photos FOR SELECT 
  TO public
  USING (true);

-- 只允許認證用戶修改
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

-- ========================================
-- 4. 更新 Storage Bucket 政策
-- ========================================

-- 刪除舊的公開寫入政策
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- 公開讀取
CREATE POLICY "Public can view files"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'article-photos');

-- 只允許認證用戶上傳/修改/刪除
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

-- ========================================
-- 完成！
-- ========================================

SELECT 'Security setup completed successfully! ✅' AS status;
