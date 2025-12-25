# 🚀 Ryan's Blog - 快速設置指南

## ✅ 已完成的工作

項目已完全建置完成，包含以下功能：

### 前端架構

- ✅ Vue.js 3 + Vite 開發環境
- ✅ Tailwind CSS 華麗主題配置
- ✅ Vue Router 路由系統
- ✅ 響應式設計（支援手機、平板、桌面）

### 核心功能

- ✅ 文章列表展示（首頁）
- ✅ 文章詳情頁面
- ✅ 文章編輯器（新增/編輯/刪除）
- ✅ 照片上傳（最多 10 張）
- ✅ 自動圖片壓縮（< 1MB）
- ✅ 文章自動生成功能
- ✅ 社群媒體分享（Facebook、Twitter、LinkedIn）
- ✅ 簡易管理員認證系統

### 視覺設計

- ✅ 華麗的紫金配色主題
- ✅ 優雅的 Playfair Display 和 Cormorant 字體
- ✅ 漸變背景和金色邊框效果
- ✅ 流暢的動畫過渡效果

---

## 📋 接下來需要做的步驟

### 第 1 步：設置 Supabase 數據庫

1. **前往 Supabase 網站**  
   訪問 https://supabase.com 並登入（或註冊）

2. **創建新專案**

   - 點擊 "New Project"
   - 輸入專案名稱（例如：ryan-blog）
   - 設置資料庫密碼（請記住此密碼）
   - 選擇區域（建議：Southeast Asia - Singapore）
   - 等待專案創建完成

3. **創建數據庫表**

   點擊左側 "SQL Editor"，執行以下 SQL：

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

   -- 啟用 Row Level Security (RLS)
   ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

   -- 創建公開讀取策略
   CREATE POLICY "Allow public read access on articles"
     ON articles FOR SELECT
     USING (true);

   CREATE POLICY "Allow public read access on photos"
     ON photos FOR SELECT
     USING (true);

   -- 創建公開寫入策略（生產環境建議改為需要認證）
   CREATE POLICY "Allow public insert on articles"
     ON articles FOR INSERT
     WITH CHECK (true);

   CREATE POLICY "Allow public update on articles"
     ON articles FOR UPDATE
     USING (true);

   CREATE POLICY "Allow public delete on articles"
     ON articles FOR DELETE
     USING (true);

   CREATE POLICY "Allow public insert on photos"
     ON photos FOR INSERT
     WITH CHECK (true);

   CREATE POLICY "Allow public delete on photos"
     ON photos FOR DELETE
     USING (true);
   ```

4. **創建 Storage Bucket**

   - 點擊左側 "Storage"
   - 點擊 "New bucket"
   - 名稱：`article-photos`
   - 選擇 "Public bucket"（允許公開訪問）
   - 點擊 "Create bucket"

5. **設置 Storage 策略**

   - 在 `article-photos` bucket 上點擊三個點 → "Policies"
   - 新增以下策略：

   ```sql
   -- 允許公開上傳
   CREATE POLICY "Allow public upload"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'article-photos');

   -- 允許公開讀取
   CREATE POLICY "Allow public read"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'article-photos');

   -- 允許公開刪除
   CREATE POLICY "Allow public delete"
   ON storage.objects FOR DELETE
   USING (bucket_id = 'article-photos');
   ```

6. **獲取 Supabase 憑證**
   - 點擊左側齒輪圖示 → "API"
   - 複製以下兩項：
     - **Project URL**（例如：https://xxxxx.supabase.co）
     - **anon public key**（很長的一串字符）

### 第 2 步：配置環境變數

1. **創建 .env 檔案**

   ```bash
   cp .env.example .env
   ```

2. **編輯 .env 檔案**
   將剛才複製的 Supabase 憑證填入：
   ```
   VITE_SUPABASE_URL=https://你的專案ID.supabase.co
   VITE_SUPABASE_ANON_KEY=你的anon_key
   ```

### 第 3 步：啟動開發伺服器

```bash
npm run dev
```

訪問 http://localhost:5173 即可看到網站！

### 第 4 步：測試功能

1. **管理員登入**

   - 點擊右上角「管理員」
   - 輸入密碼：`admin123`

2. **撰寫文章**

   - 登入後點擊「撰寫文章」
   - 可使用「自動生成文章」按鈕快速填充內容
   - 上傳照片（最多 10 張）
   - 點擊「發布文章」

3. **查看文章**
   - 返回首頁查看已發布的文章
   - 點擊文章卡片查看詳情
   - 測試社群媒體分享功能

### 第 5 步：推送到 GitHub

```bash
git push -u origin main
```

### 第 6 步：部署到 Netlify

#### 方法 A：通過 Netlify 網站（推薦）

1. 訪問 https://app.netlify.com
2. 登入後點擊 "Add new site" → "Import an existing project"
3. 選擇 "GitHub"，授權後選擇 `RyanBlog` 倉庫
4. 配置構建設置：
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. 點擊 "Add environment variables" 添加：
   - `VITE_SUPABASE_URL`: 你的 Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: 你的 Supabase Key
6. 點擊 "Deploy site"

#### 方法 B：使用 Netlify CLI

```bash
# 安裝 Netlify CLI
npm install -g netlify-cli

# 登入 Netlify
netlify login

# 初始化並部署
netlify init
netlify deploy --prod
```

---

## 🎨 自定義設置

### 修改管理員密碼

編輯 `src/views/AdminLogin.vue`，修改第 56 行：

```javascript
const ADMIN_PASSWORD = "your_new_password";
```

### 修改主題顏色

編輯 `tailwind.config.js`，自定義 `colors.luxury` 下的顏色：

```javascript
luxury: {
  gold: '#D4AF37',        // 金色
  darkGold: '#B8860B',    // 深金色
  purple: '#4A148C',      // 紫色
  deepPurple: '#311B92',  // 深紫色
  rose: '#C2185B',        // 玫瑰色
  cream: '#FFF8E7',       // 奶油色
}
```

### 新增文章生成範本

編輯 `src/utils/articleGenerator.js`，在 `templates` 數組中添加新範本。

---

## 📁 項目結構

```
RyanProject/
├── src/
│   ├── components/          # Vue 組件
│   │   ├── Header.vue       # 導航欄
│   │   ├── Footer.vue       # 頁腳
│   │   ├── ArticleCard.vue  # 文章卡片
│   │   ├── PhotoUploader.vue # 照片上傳
│   │   └── SocialShare.vue  # 社群分享
│   ├── views/               # 頁面視圖
│   │   ├── Home.vue         # 首頁
│   │   ├── ArticleDetail.vue # 文章詳情
│   │   ├── ArticleEditor.vue # 文章編輯器
│   │   └── AdminLogin.vue   # 管理員登入
│   ├── services/            # API 服務
│   │   └── supabase.js      # Supabase 客戶端
│   ├── utils/               # 工具函數
│   │   ├── imageCompression.js # 圖片壓縮
│   │   ├── socialShare.js   # 社群分享
│   │   └── articleGenerator.js # 文章生成
│   ├── router/              # 路由配置
│   │   └── index.js
│   ├── App.vue              # 根組件
│   ├── main.js              # 入口文件
│   └── style.css            # 全局樣式
├── public/                  # 靜態資源
├── .env.example             # 環境變數範例
├── .gitignore
├── index.html
├── package.json
├── vite.config.js           # Vite 配置
├── tailwind.config.js       # Tailwind 配置
├── postcss.config.js
├── netlify.toml             # Netlify 配置
└── README.md
```

---

## 🔧 常見問題

### Q: 為什麼看不到文章？

A: 請確認：

1. Supabase 環境變數已正確配置
2. 數據庫表已創建
3. RLS 策略已設置
4. 瀏覽器控制台沒有報錯

### Q: 照片上傳失敗？

A: 請確認：

1. Storage bucket `article-photos` 已創建
2. Bucket 設置為 public
3. Storage 策略已正確配置

### Q: 如何修改密碼？

A: 編輯 `src/views/AdminLogin.vue` 中的 `ADMIN_PASSWORD` 常量

### Q: 如何添加真實的認證系統？

A: 建議整合 Supabase Auth：

1. 在 Supabase 中啟用 Email/Password 認證
2. 修改登入頁面使用 `supabase.auth.signInWithPassword()`
3. 在路由守衛中檢查 `supabase.auth.getSession()`

---

## 📝 後續改進建議

1. **SEO 優化**

   - 添加 vue-meta 或 @vueuse/head
   - 為每個頁面設置 meta 標籤

2. **性能優化**

   - 實現虛擬滾動（文章很多時）
   - 添加圖片懶加載

3. **功能增強**

   - 文章分類和標籤
   - 文章搜索功能
   - 評論系統
   - 文章瀏覽統計

4. **安全性**
   - 整合 Supabase Auth 替代簡易密碼
   - 添加 CSRF 保護
   - 實現更細緻的 RLS 策略

---

## 🎉 開始使用

```bash
# 1. 安裝依賴（已完成）
npm install

# 2. 配置環境變數
cp .env.example .env
# 編輯 .env 填入 Supabase 憑證

# 3. 啟動開發伺服器
npm run dev

# 4. 構建生產版本
npm run build

# 5. 預覽生產版本
npm run preview
```

祝您使用愉快！✨

如有任何問題，歡迎查看：

- Vue.js 文檔: https://vuejs.org
- Supabase 文檔: https://supabase.com/docs
- Tailwind CSS 文檔: https://tailwindcss.com/docs
