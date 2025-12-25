# Vercel 部署指南

## 問題診斷：載入文章失敗

如果在 Vercel 部署後看到「載入文章失敗」或 Supabase 連線錯誤，請按照以下步驟檢查和修復。

## 🔍 常見原因

1. **環境變數未設置** - Vercel 環境變數未配置
2. **Supabase URL 配置錯誤** - API 限制或域名白名單問題
3. **CORS 設置** - Supabase 需要允許 Vercel 域名

## ✅ 解決步驟

### 步驟 1: 在 Vercel 設置環境變數

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 選擇您的專案（ryanblog-olive）
3. 點擊 **Settings** → **Environment Variables**
4. 添加以下環境變數：

```
VITE_SUPABASE_URL
值: https://sefyuwnxedbcxmvalits.supabase.co

VITE_SUPABASE_ANON_KEY
值: (從 Supabase Dashboard 複製 anon/public key)
```

**重要**:

- 變數名稱必須完全一致，包括 `VITE_` 前綴
- 不要加引號
- 選擇 **All Environments** (Production, Preview, Development)

### 步驟 2: 獲取 Supabase 憑證

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇專案 `sefyuwnxedbcxmvalits`
3. 點擊左側 **Settings** (齒輪圖標)
4. 選擇 **API**
5. 複製以下內容：
   - **Project URL** → 用於 `VITE_SUPABASE_URL`
   - **Project API keys** → **anon/public** → 用於 `VITE_SUPABASE_ANON_KEY`

### 步驟 3: 配置 Supabase 允許的域名

1. 在 Supabase Dashboard
2. 點擊 **Authentication** → **URL Configuration**
3. 在 **Site URL** 添加：
   ```
   https://ryanblog-olive.vercel.app
   ```
4. 在 **Redirect URLs** 添加：
   ```
   https://ryanblog-olive.vercel.app/auth/callback
   https://ryanblog-olive.vercel.app/*
   ```

### 步驟 4: 重新部署

在 Vercel Dashboard：

1. 點擊 **Deployments** 標籤
2. 找到最新的部署
3. 點擊右側的 **⋯** → **Redeploy**
4. 選擇 **Redeploy**（不需要清除緩存）

或者在本地推送代碼觸發自動部署：

```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin main
```

### 步驟 5: 驗證部署

1. 等待 Vercel 構建完成（約 1-2 分鐘）
2. 訪問 https://ryanblog-olive.vercel.app
3. 檢查瀏覽器控制台（F12）是否有錯誤
4. 確認文章可以正常載入

## 🔧 故障排除

### 錯誤 1: "Supabase 環境變數尚未配置"

**症狀**: 控制台顯示紅色錯誤訊息

**解決**:

1. 確認 Vercel 環境變數已設置
2. 確認變數名稱拼寫正確（包括 `VITE_` 前綴）
3. 重新部署專案

### 錯誤 2: "Failed to fetch" 或 CORS 錯誤

**症狀**: 網絡請求被阻擋

**解決**:

1. 檢查 Supabase URL Configuration
2. 確認 Vercel 域名已添加到允許列表
3. 檢查 Supabase 專案是否暫停（免費版會自動暫停）

### 錯誤 3: 404 Not Found

**症狀**: 刷新頁面或直接訪問文章頁面顯示 404

**解決**:

1. 確認 `vercel.json` 文件存在
2. 確認 rewrites 規則正確配置
3. 重新部署

### 錯誤 4: "Invalid API key"

**症狀**: Supabase 返回認證錯誤

**解決**:

1. 重新從 Supabase Dashboard 複製 API key
2. 確認複製的是 **anon** key，不是 **service_role** key
3. 更新 Vercel 環境變數
4. 重新部署

## 📋 檢查清單

部署前確認：

- [ ] Vercel 專案已創建
- [ ] `VITE_SUPABASE_URL` 環境變數已設置
- [ ] `VITE_SUPABASE_ANON_KEY` 環境變數已設置
- [ ] Supabase Site URL 包含 Vercel 域名
- [ ] Supabase Redirect URLs 包含 `/auth/callback`
- [ ] `vercel.json` 文件已提交到 Git
- [ ] 代碼已推送到 GitHub/GitLab
- [ ] Vercel 自動部署成功
- [ ] 瀏覽器控制台無錯誤

## 🚀 自動化部署流程

當您推送代碼到 GitHub 時，Vercel 會自動：

1. 檢測到新的提交
2. 開始構建專案
3. 使用設置的環境變數
4. 部署到生產環境
5. 發送部署通知

## 📊 監控和調試

### 查看構建日誌

1. Vercel Dashboard → Deployments
2. 點擊部署記錄
3. 查看 **Building** 和 **Functions** 日誌

### 查看運行時日誌

1. Vercel Dashboard → Deployments
2. 點擊 **Function Logs**
3. 實時查看錯誤和警告

### 瀏覽器調試

1. 打開網站
2. 按 F12 開啟開發者工具
3. 查看 Console 標籤的錯誤訊息
4. 查看 Network 標籤的請求狀態

## 🔐 安全建議

1. **永不提交 .env 文件** - 已在 .gitignore 中排除
2. **使用 anon key** - 不要使用 service_role key
3. **啟用 RLS** - Row Level Security 已配置
4. **定期更新密鑰** - 如果懷疑洩露立即更換

## 🌐 多環境配置

### Production（生產環境）

- URL: https://ryanblog-olive.vercel.app
- 環境: Production
- 分支: main

### Preview（預覽環境）

- URL: 自動生成（每個 PR 或分支）
- 環境: Preview
- 用於測試新功能

### Development（開發環境）

- URL: http://localhost:5173
- 環境: 使用 .env 文件
- 本地開發測試

## 📞 需要幫助？

如果問題仍未解決：

1. **檢查 Vercel 狀態**: https://www.vercel-status.com/
2. **檢查 Supabase 狀態**: https://status.supabase.com/
3. **查看文檔**:
   - Vercel: https://vercel.com/docs
   - Supabase: https://supabase.com/docs
4. **提供錯誤信息**:
   - 瀏覽器控制台截圖
   - Vercel 構建日誌
   - Supabase 錯誤訊息

---

最後更新: 2025 年 12 月 25 日
