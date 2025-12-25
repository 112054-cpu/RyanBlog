# ⚡ 5 分鐘快速開始

## 🎯 您看到錯誤訊息了嗎？

如果您看到 "Supabase 尚未配置" 的錯誤，別擔心！跟著以下步驟，5 分鐘內就能完成設置。

---

## 📋 超快速設置（3 步驟）

### 步驟 1：創建 Supabase 專案 (2 分鐘)

1. 訪問：https://app.supabase.com
2. 點擊 **"New Project"**
3. 填寫：
   - Name: `ryan-blog`（或任何您喜歡的名字）
   - Database Password: 設置一個密碼（請記住！）
   - Region: `Southeast Asia (Singapore)` 或最近的區域
4. 點擊 **"Create new project"**
5. 等待 1-2 分鐘讓專案初始化

### 步驟 2：設置數據庫 (2 分鐘)

1. 在左側點擊 **"SQL Editor"**
2. 點擊 **"New query"**
3. **複製以下完整 SQL** 並貼上：

```sql
-- 創建文章表
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建照片表
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 啟用公開訪問
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON articles FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON articles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON articles FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON articles FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON photos FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON photos FOR DELETE USING (true);
```

4. 點擊右下角 **"Run"** 按鈕
5. 看到 "Success. No rows returned" 就成功了！

6. **設置 Storage**：
   - 點擊左側 **"Storage"**
   - 點擊 **"Create a new bucket"**
   - Name: `article-photos`
   - 勾選 **"Public bucket"**
   - 點擊 **"Create bucket"**

### 步驟 3：配置專案 (1 分鐘)

1. 在 Supabase 點擊左下角 **齒輪圖示 (Settings)**
2. 點擊 **"API"**
3. 複製兩個值：

   - **Project URL** (例如：`https://abcdefgh.supabase.co`)
   - **anon public** key (一長串字符)

4. **編輯專案中的 `.env` 文件**：

```env
VITE_SUPABASE_URL=https://你的專案ID.supabase.co
VITE_SUPABASE_ANON_KEY=你的長長的key
```

5. **重啟開發伺服器**：
   - 在終端機按 `Ctrl+C` 停止
   - 執行 `npm run dev`
   - 刷新瀏覽器

---

## ✅ 完成！

現在訪問 http://localhost:5173 應該可以看到正常的首頁了！

### 🎯 測試您的設置

1. 點擊右上角 **"管理員"**
2. 輸入密碼：`admin123`
3. 點擊 **"撰寫文章"**
4. 試試 **"自動生成文章"** 按鈕
5. 上傳幾張照片
6. 點擊 **"發布文章"**
7. 返回首頁查看您的第一篇文章！

---

## ❓ 常見問題

### Q: 我在哪裡找到 `.env` 文件？

A: 它在專案根目錄：`/Users/steven/Documents/RyanProject/.env`

### Q: 修改 `.env` 後沒有效果？

A: 記得要重啟開發伺服器：

```bash
# 在終端機按 Ctrl+C，然後
npm run dev
```

### Q: SQL 執行失敗？

A: 確保：

1. 一次複製貼上完整的 SQL
2. 點擊 "Run" 按鈕
3. 如果出錯，嘗試先執行 `DROP TABLE IF EXISTS articles, photos CASCADE;` 然後重試

### Q: Storage bucket 創建失敗？

A: 確保：

1. Bucket 名稱是 `article-photos`（沒有空格）
2. 勾選了 "Public bucket"
3. 如果已存在，直接使用即可

### Q: 照片上傳失敗？

A: 在 Supabase Storage 中：

1. 選擇 `article-photos` bucket
2. 點擊右上角三個點 → "Policies"
3. 點擊 "New Policy"
4. 選擇 "For full customization"
5. Policy name: `Public Access`
6. 勾選所有操作 (SELECT, INSERT, UPDATE, DELETE)
7. 使用表達式：`true`
8. 點擊 "Review" → "Save policy"

---

## 🚀 下一步

設置完成後，您可以：

1. **自定義樣式**：編輯 `tailwind.config.js` 中的顏色
2. **修改密碼**：編輯 `src/views/AdminLogin.vue` 中的 `ADMIN_PASSWORD`
3. **添加測試數據**：使用自動生成功能創建幾篇文章
4. **部署到 Netlify**：查看 `SETUP_GUIDE.md` 的部署章節

---

## 📞 需要幫助？

- 詳細設置：查看 `SUPABASE_SETUP.md`
- 完整文檔：查看 `SETUP_GUIDE.md`
- 功能說明：查看 `FEATURES.md`

祝您使用愉快！🎉
