# 禁用 Email 確認設置

為了讓管理員可以直接創建帳號並登入，請在 Supabase 設置中禁用 email 確認：

## 方法 1：通過 Dashboard（推薦）

1. 前往 Supabase Dashboard
2. 進入你的專案 (sefyuwnxedbcxmvalits)
3. 點擊左側 **Authentication** → **Settings**
4. 找到 **Email Auth** 部分
5. 關閉 **Enable email confirmations**
6. 點擊 **Save**

## 方法 2：使用 SQL（快速）

在 SQL Editor 執行：

```sql
-- 禁用 email 確認
UPDATE auth.config 
SET value = 'false' 
WHERE name = 'enable_signup';

-- 或者使用 Supabase Dashboard 設置
-- Authentication > Settings > Email Auth
-- 關閉 "Enable email confirmations"
```

## 完成後

1. 前往 https://ryanblogmac.netlify.app/admin
2. 點擊「沒有帳號？點此創建」
3. 輸入您的 Email 和密碼（至少 6 個字符）
4. 點擊「創建帳號」
5. 帳號創建成功後會自動登入

## 注意事項

- Email 不需要是真實的，可以使用 `admin@example.com` 等
- 密碼請務必記住，無法找回
- 建議使用強密碼（至少 12 個字符）
