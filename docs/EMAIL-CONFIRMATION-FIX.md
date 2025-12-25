# 修復郵件確認鏈接問題

## 問題描述

創建帳號後，收到的確認郵件中點擊確認鏈接會出現「無法連接伺服器」的錯誤。

## 原因

Supabase 默認的郵件確認重定向 URL 可能指向錯誤的地址（如 localhost:3000），但實際開發服務器運行在不同端口（localhost:5173）。

## 解決方案

### 步驟 1: 配置 Supabase 重定向 URL

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇您的項目 (sefyuwnxedbcxmvalits)
3. 點擊左側菜單的 **Authentication** → **URL Configuration**
4. 找到 **Redirect URLs** 部分
5. 添加以下 URL：
   ```
   http://localhost:5173/auth/callback
   http://localhost:5174/auth/callback
   https://ryanblogmac.netlify.app/auth/callback
   ```
6. 點擊 **Save**

### 步驟 2: 配置郵件模板（可選）

1. 在 Supabase Dashboard，點擊 **Authentication** → **Email Templates**
2. 選擇 **Confirm signup** 模板
3. 確認 `{{ .ConfirmationURL }}` 變量存在
4. 如果需要自定義，可以修改模板內容

### 步驟 3: 測試郵件確認流程

#### 本地測試（開發環境）

1. 確保開發服務器正在運行：

   ```bash
   npm run dev
   ```

   記下實際端口（通常是 5173 或 5174）

2. 打開瀏覽器訪問 http://localhost:5173/login

3. 點擊「註冊」標籤

4. 填寫註冊信息：

   - Email: 使用您的真實郵箱
   - Password: 至少 6 個字符
   - Display Name: 您的名稱

5. 點擊「註冊」

6. 檢查郵箱（也要檢查垃圾郵件資料夾）

7. 點擊郵件中的「Confirm your mail」鏈接

8. 應該會跳轉到 http://localhost:5173/auth/callback 並顯示成功訊息

9. 3 秒後自動跳轉到登入頁面

#### 生產環境測試

1. 確保生產環境的重定向 URL 已配置：

   ```
   https://ryanblogmac.netlify.app/auth/callback
   ```

2. 部署最新代碼到 Netlify

3. 在生產網站註冊新帳號

4. 點擊確認郵件中的鏈接

5. 應該會跳轉到 https://ryanblogmac.netlify.app/auth/callback

## 驗證頁面功能

新創建的 `/auth/callback` 頁面會處理以下情況：

### ✅ 成功驗證

- 顯示綠色勾選和成功訊息
- 3 秒後自動跳轉到登入頁面
- 可以立即登入使用

### ℹ️ 已驗證

- 如果帳號已經驗證過，顯示藍色資訊圖標
- 提示帳號已完成驗證
- 提供登入鏈接

### ❌ 驗證失敗

- 顯示紅色叉號和錯誤訊息
- 提供「重試」按鈕
- 提供返回登入頁面鏈接

### ⏳ 載入中

- 顯示載入動畫
- 提示正在驗證

## 常見問題排除

### Q1: 點擊確認鏈接後顯示「無法連接伺服器」

**A:** 檢查以下幾點：

1. 開發服務器是否正在運行？執行 `npm run dev`
2. 確認實際端口，URL 應該匹配（5173 或 5174）
3. 檢查 Supabase 的 Redirect URLs 配置是否包含正確的本地端口

### Q2: 顯示「缺少驗證令牌」錯誤

**A:**

1. 確認郵件鏈接沒有被截斷
2. 完整複製郵件中的整個 URL 並貼到瀏覽器
3. 不要手動編輯 URL

### Q3: 顯示「無效的驗證類型」錯誤

**A:**

1. 重新註冊一個新帳號進行測試
2. 確認使用的是最新的郵件確認鏈接
3. 舊的確認鏈接可能已過期

### Q4: 郵件沒有收到

**A:**

1. 檢查垃圾郵件資料夾
2. 確認郵箱地址輸入正確
3. 在 Supabase Dashboard → Authentication → Users 查看用戶狀態
4. 如果狀態顯示 "Waiting for verification"，可以手動重新發送確認郵件

### Q5: 確認後仍然無法登入

**A:**

1. 確認在 Supabase → Authentication → Users 中用戶的 `email_confirmed_at` 欄位有值
2. 如果沒有，可以在 SQL Editor 手動確認：
   ```sql
   UPDATE auth.users
   SET email_confirmed_at = NOW()
   WHERE email = 'your-email@example.com';
   ```

## 手動確認帳號（緊急情況）

如果郵件確認一直有問題，可以在 Supabase SQL Editor 執行：

```sql
-- 查看待確認的用戶
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email_confirmed_at IS NULL;

-- 手動確認特定用戶
UPDATE auth.users
SET email_confirmed_at = NOW(),
    confirmation_token = NULL,
    confirmation_sent_at = NULL
WHERE email = 'user@example.com';

-- 確認是否已更新
SELECT id, email, email_confirmed_at
FROM auth.users
WHERE email = 'user@example.com';
```

## 開發環境 vs 生產環境

### 開發環境（localhost）

- URL: `http://localhost:5173/auth/callback` 或 `http://localhost:5174/auth/callback`
- 需要開發服務器正在運行
- 適合測試流程

### 生產環境（Netlify）

- URL: `https://ryanblogmac.netlify.app/auth/callback`
- 自動部署，無需手動啟動
- 實際用戶註冊使用

## 測試檢查清單

- [ ] Supabase Redirect URLs 已配置本地和生產 URL
- [ ] 開發服務器正在運行（本地測試）
- [ ] `/auth/callback` 路由已添加到 router
- [ ] AuthCallback.vue 組件已創建
- [ ] 註冊新帳號
- [ ] 檢查郵箱（包括垃圾郵件）
- [ ] 點擊確認鏈接
- [ ] 驗證頁面顯示成功
- [ ] 自動跳轉到登入頁面
- [ ] 使用新帳號登入成功

## 監控和日誌

在瀏覽器開發者工具（F12）的 Console 標籤可以看到：

```
Auth callback params: { type: 'signup', errorCode: null, errorDescription: null, hasToken: true }
```

如果看到錯誤，會顯示詳細的錯誤信息。

## 部署到生產環境

修復完成後，需要部署到 Netlify：

```bash
cd /Users/steven/Documents/RyanProject
git add .
git commit -m "Add auth callback page to handle email confirmation"
git push origin main
```

Netlify 會自動部署，幾分鐘後即可在生產環境測試。

---

最後更新: 2024-12-25
