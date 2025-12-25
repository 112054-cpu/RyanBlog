# 禁用 Email 確認設置

## 方法 1：通過 Supabase Dashboard（最新版本）

1. 前往 https://supabase.com/dashboard/project/sefyuwnxedbcxmvalits
2. 點擊左側 **Authentication**
3. 點擊上方 **Providers** 標籤
4. 找到 **Email** provider
5. 點擊 **Email** 展開設置
6. 找到 **Confirm email** 或 **Enable email confirmations**
7. 關閉該選項
8. 點擊 **Save**

## 方法 2：使用 SQL（最簡單、最可靠）

直接在 Supabase SQL Editor 執行以下 SQL：

前往：https://supabase.com/dashboard/project/sefyuwnxedbcxmvalits/sql/new

```sql
-- 方法 A：直接更新 auth.config 表
-- 如果上面的方法不行，使用這個
DO $$
BEGIN
  -- 嘗試更新現有配置
  UPDATE auth.config
  SET value = jsonb_set(value, '{enable_signup}', 'true')
  WHERE name = 'auth';

  -- 如果沒有記錄，則插入
  IF NOT FOUND THEN
    INSERT INTO auth.config (name, value)
    VALUES ('auth', '{"enable_signup": true}');
  END IF;
END $$;
```

## 方法 3：調整代碼（無需更改 Supabase 設置）

如果以上方法都不行，我們可以調整代碼讓註冊功能在需要 email 確認時也能正常提示用戶。

## 測試註冊是否正常

執行完上述任一方法後：

1. 前往 https://ryanblogmac.netlify.app/admin
2. 點擊「沒有帳號？點此創建」
3. 輸入：
   - Email: `test@example.com`
   - Password: `test123456`
4. 點擊「創建帳號」
5. 應該會顯示「帳號創建成功！」並自動跳轉

## 如果還是不行

請告訴我您看到什麼錯誤訊息，我會調整代碼來處理。
