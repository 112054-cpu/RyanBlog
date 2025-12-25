# 評論系統使用指南

## 📋 概述

本博客系統現在支援完整的評論功能，包含用戶角色管理和評論審核機制。

## 🎭 用戶角色

### 1. 管理員（Admin）

- **自動設定**：第一個註冊的用戶自動成為管理員
- **權限**：
  - ✅ 撰寫和編輯文章
  - ✅ 審核、批准、拒絕、刪除評論
  - ✅ 查看所有評論（包括待審核的）
  - ✅ 查看評論統計數據

### 2. 普通用戶（User）

- **註冊方式**：透過登入頁面註冊
- **權限**：
  - ✅ 查看所有已發布的文章
  - ✅ 在文章下留言
  - ✅ 查看已批准的評論
  - ❌ 不能撰寫文章
  - ❌ 不能審核評論

## 🗄️ 數據庫設置

### 步驟 1：執行 SQL 腳本

1. 登入您的 Supabase Dashboard
2. 前往 SQL Editor
3. 複製並執行 `comments-system-setup.sql` 文件中的所有內容
4. 確認所有表格和策略已成功創建

### 步驟 2：驗證設置

檢查以下表格是否已創建：

- ✅ `user_profiles` - 用戶資料表
- ✅ `comments` - 評論表

檢查 RLS 策略是否啟用：

```sql
-- 檢查 user_profiles 的 RLS 策略
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- 檢查 comments 的 RLS 策略
SELECT * FROM pg_policies WHERE tablename = 'comments';
```

## 🚀 功能特點

### 評論提交流程

1. **用戶登入**

   - 訪問 `/admin` 頁面
   - 註冊或登入帳號

2. **撰寫評論**

   - 在文章詳情頁底部找到評論區
   - 輸入評論內容
   - 點擊「發表留言」按鈕

3. **等待審核**
   - 評論提交後狀態為「待審核」
   - 顯示提示：「您的留言將在管理員批准後顯示」
   - 評論不會立即顯示在頁面上

### 管理員審核流程

1. **訪問審核頁面**

   - 登入管理員帳號
   - 點擊 Header 中的「評論審核」鏈接
   - 紅色數字徽章顯示待審核數量

2. **查看評論**

   - **全部**：查看所有評論
   - **待審核**：僅顯示待審核的評論
   - **已批准**：顯示已批准的評論
   - **已拒絕**：顯示已拒絕的評論

3. **操作選項**
   - ✅ **批准**：評論將顯示在文章頁面
   - ❌ **拒絕**：評論不會顯示，但保留在數據庫中
   - 🗑️ **刪除**：永久刪除評論

## 🔒 安全機制

### Row Level Security (RLS) 策略

1. **user_profiles 表**

   ```sql
   -- 所有人可查看用戶資料
   -- 用戶只能插入和更新自己的資料
   -- 不能修改自己的角色
   ```

2. **comments 表**
   ```sql
   -- 所有人可查看已批准的評論
   -- 管理員可查看所有評論
   -- 已登入用戶可提交評論
   -- 管理員可更新和刪除評論
   ```

### 自動化機制

1. **自動創建用戶資料**

   - 註冊時自動創建 user_profile
   - 第一個用戶自動設為管理員
   - 後續用戶自動設為普通用戶

2. **自動時間戳**
   - 創建時間自動記錄
   - 更新時間自動更新

## 🎨 用戶界面

### 評論區（ArticleDetail 頁面）

- **已登入用戶**：

  - 顯示評論輸入框
  - 顯示所有已批准的評論
  - 提示：評論需審核後顯示

- **未登入用戶**：
  - 顯示登入提示
  - 顯示「前往登入」按鈕
  - 可查看已批准的評論

### 評論審核頁面（管理員專用）

- **統計卡片**：

  - 待審核數量（黃色）
  - 已批准數量（綠色）
  - 已拒絕數量（紅色）

- **篩選標籤**：

  - 全部 / 待審核 / 已批准 / 已拒絕
  - 每個標籤顯示對應數量

- **評論卡片**：
  - 用戶頭像和名稱
  - 評論內容
  - 所屬文章標題
  - 提交時間
  - 操作按鈕

### Header 導航欄

- **管理員用戶**：

  - 首頁
  - ✍️ 撰寫文章
  - 💬 評論審核（顯示待審核數量徽章）
  - 登出

- **普通用戶**：

  - 首頁
  - 登出

- **未登入**：
  - 首頁
  - 登入

## 🔄 評論狀態流程

```
提交評論 → pending (待審核)
           ↓
    管理員審核
    ↙          ↘
approved      rejected
(已批准)      (已拒絕)
   ↓              ↓
顯示在頁面    不顯示
```

## 📊 數據結構

### user_profiles 表

| 欄位         | 類型      | 說明                       |
| ------------ | --------- | -------------------------- |
| id           | UUID      | 用戶 ID（對應 auth.users） |
| email        | TEXT      | 電子郵件                   |
| display_name | TEXT      | 顯示名稱                   |
| role         | TEXT      | 角色（admin/user）         |
| created_at   | TIMESTAMP | 創建時間                   |
| updated_at   | TIMESTAMP | 更新時間                   |

### comments 表

| 欄位       | 類型      | 說明                              |
| ---------- | --------- | --------------------------------- |
| id         | UUID      | 評論 ID                           |
| article_id | UUID      | 文章 ID                           |
| user_id    | UUID      | 用戶 ID                           |
| content    | TEXT      | 評論內容                          |
| status     | TEXT      | 狀態（pending/approved/rejected） |
| created_at | TIMESTAMP | 創建時間                          |
| updated_at | TIMESTAMP | 更新時間                          |

## 🐛 故障排除

### 問題 1：無法提交評論

**可能原因**：

- 未登入
- RLS 策略未正確設置
- user_profile 未創建

**解決方法**：

1. 確認已登入
2. 檢查 Supabase 的 RLS 策略
3. 確認 user_profiles 表有對應記錄

### 問題 2：管理員看不到待審核評論

**可能原因**：

- 角色未正確設置為 admin
- RLS 策略問題

**解決方法**：

```sql
-- 檢查用戶角色
SELECT * FROM user_profiles WHERE email = 'your-email@example.com';

-- 手動更新為管理員（如需要）
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### 問題 3：第一個用戶沒有自動成為管理員

**解決方法**：

```sql
-- 手動設置第一個用戶為管理員
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## 🎯 最佳實踐

1. **定期審核評論**

   - 每天檢查待審核評論
   - 及時批准或拒絕

2. **管理用戶角色**

   - 謹慎分配管理員權限
   - 定期檢查用戶列表

3. **內容審查**

   - 檢查垃圾評論
   - 過濾不當內容

4. **性能優化**
   - 定期清理已拒絕的舊評論
   - 優化數據庫索引

## 📝 API 使用示例

### 提交評論

```javascript
import { commentsApi } from "../services/supabase";

await commentsApi.create({
  article_id: "article-uuid",
  content: "這是一條評論",
});
```

### 審核評論

```javascript
// 批准評論
await commentsApi.updateStatus("comment-id", "approved");

// 拒絕評論
await commentsApi.updateStatus("comment-id", "rejected");
```

### 刪除評論

```javascript
await commentsApi.delete("comment-id");
```

## 🔐 權限總結

| 操作           | 未登入 | 普通用戶 | 管理員 |
| -------------- | ------ | -------- | ------ |
| 查看文章       | ✅     | ✅       | ✅     |
| 查看已批准評論 | ✅     | ✅       | ✅     |
| 提交評論       | ❌     | ✅       | ✅     |
| 撰寫文章       | ❌     | ❌       | ✅     |
| 編輯文章       | ❌     | ❌       | ✅     |
| 審核評論       | ❌     | ❌       | ✅     |
| 查看待審核評論 | ❌     | ❌       | ✅     |
| 刪除評論       | ❌     | ❌       | ✅     |

## 🚀 部署注意事項

1. **執行 SQL 腳本**

   - 在生產環境執行 `comments-system-setup.sql`
   - 確認所有表格和策略已創建

2. **設置第一個管理員**

   - 註冊第一個帳號將自動成為管理員
   - 或手動在 Supabase 中設置

3. **測試功能**

   - 測試評論提交
   - 測試審核流程
   - 測試權限控制

4. **推送到 Git**

   ```bash
   git add .
   git commit -m "Add comment system with role-based access control"
   git push origin main
   ```

5. **Netlify 自動部署**
   - 推送後自動部署
   - 檢查部署日誌

## 📞 支援

如有問題，請檢查：

1. Supabase Dashboard 的 RLS 策略
2. 瀏覽器控制台錯誤訊息
3. Netlify 部署日誌
