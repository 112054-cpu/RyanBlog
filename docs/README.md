# Ryan's Blog - 華麗部落格

一個採用華麗風格設計的現代化部落格平台

## 技術棧

- **前端**: Vue.js 3 + Vite
- **樣式**: Tailwind CSS
- **後端/資料庫**: Supabase
- **部署**: Netlify

## 功能特色

- ✨ 華麗的視覺設計
- 📝 文章管理系統（新增、編輯、刪除）
- 🎨 文章生成功能
- 📸 每篇文章支援最多 10 張照片上傳
- 🗜️ 自動圖片壓縮（小於 1MB）
- 📱 響應式設計
- 🔗 社群媒體分享功能

## 開發設置

1. 安裝依賴：

```bash
npm install
```

2. 配置環境變數：
   複製 `.env.example` 為 `.env` 並填入你的 Supabase 憑證

3. 啟動開發伺服器：

```bash
npm run dev
```

4. 建置生產版本：

```bash
npm run build
```

## Supabase 資料庫結構

### Articles 表

```sql
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Photos 表

```sql
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 部署

本專案配置為自動部署至 Netlify。推送至 main 分支即可觸發自動部署。

## 版本管理

GitHub Repository: https://github.com/112054-cpu/RyanBlog.git
