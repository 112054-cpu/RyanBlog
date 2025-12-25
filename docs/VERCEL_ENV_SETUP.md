# Vercel 環境變數設置指南

## 🚨 緊急修復：載入文章失敗

如果您在 https://ryanblog-olive.vercel.app 看到「載入文章失敗」，這是因為環境變數未設置。

## ⚡ 快速修復步驟

### 1️⃣ 登入 Vercel

訪問 https://vercel.com/dashboard 並登入您的帳號

### 2️⃣ 選擇專案

找到並點擊 `ryanblog-olive` 專案

### 3️⃣ 進入設置

點擊頂部的 **Settings** 標籤

### 4️⃣ 添加環境變數

1. 在左側菜單選擇 **Environment Variables**

2. 點擊右上角 **Add** 按鈕

3. 添加第一個變數：

   ```
   Name: VITE_SUPABASE_URL
   Value: https://sefyuwnxedbcxmvalits.supabase.co
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

   點擊 **Save**

4. 再次點擊 **Add** 按鈕

5. 添加第二個變數：
   ```
   Name: VITE_SUPABASE_ANON_KEY
   Value: (需要從 Supabase 獲取)
   Environments: ✅ Production ✅ Preview ✅ Development
   ```
   點擊 **Save**

### 5️⃣ 獲取 Supabase Anon Key

1. 訪問 https://supabase.com/dashboard
2. 選擇專案 `sefyuwnxedbcxmvalits`
3. 點擊左側 ⚙️ **Settings**
4. 選擇 **API**
5. 找到 **Project API keys** 區塊
6. 複製 **anon** / **public** key（很長的一串字）
7. 回到 Vercel，貼到 `VITE_SUPABASE_ANON_KEY` 的 Value 欄位

### 6️⃣ 重新部署

1. 在 Vercel Dashboard，點擊 **Deployments** 標籤
2. 找到最新的部署記錄
3. 點擊右側的 **⋯** 選單
4. 選擇 **Redeploy**
5. 確認 **Redeploy**

### 7️⃣ 等待完成

- 構建通常需要 1-2 分鐘
- 完成後會自動更新網站
- 刷新 https://ryanblog-olive.vercel.app 查看結果

## ✅ 驗證環境變數

設置完成後，您應該看到兩個環境變數：

| Name                   | Value            | Environments                     |
| ---------------------- | ---------------- | -------------------------------- |
| VITE_SUPABASE_URL      | https://sefyu... | Production, Preview, Development |
| VITE_SUPABASE_ANON_KEY | eyJhbG...        | Production, Preview, Development |

## 🔍 故障排除

### 問題：仍然顯示「載入文章失敗」

**解決方案**：

1. 確認環境變數名稱完全正確（包括 `VITE_` 前綴）
2. 確認 Value 沒有多餘的空格或引號
3. 確認所有三個環境都勾選了
4. 清除瀏覽器緩存後重試

### 問題：Supabase 返回 401 錯誤

**解決方案**：

1. 確認複製的是 **anon** key，不是 service_role key
2. 重新從 Supabase Dashboard 複製 key
3. 確認 Supabase 專案沒有被暫停

### 問題：CORS 錯誤

**解決方案**：

1. 登入 Supabase Dashboard
2. 點擊 **Authentication** → **URL Configuration**
3. 在 **Site URL** 添加：`https://ryanblog-olive.vercel.app`
4. 在 **Redirect URLs** 添加：`https://ryanblog-olive.vercel.app/*`

## 📱 從終端機觸發重新部署

如果您有本地代碼：

```bash
cd /path/to/RyanProject
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

Vercel 會自動偵測並重新部署。

## 🎯 完成檢查清單

- [ ] VITE_SUPABASE_URL 已設置
- [ ] VITE_SUPABASE_ANON_KEY 已設置
- [ ] 兩個變數都選擇了 Production 環境
- [ ] 已觸發重新部署
- [ ] 網站可以正常載入文章
- [ ] 瀏覽器控制台沒有錯誤

## 🆘 需要協助？

如果按照以上步驟仍無法解決：

1. 檢查瀏覽器控制台（F12）的完整錯誤訊息
2. 檢查 Vercel 構建日誌是否有錯誤
3. 確認 Supabase 專案狀態正常（免費版會自動暫停）

---

設置完成後，您的網站應該能正常運作了！ 🎉
