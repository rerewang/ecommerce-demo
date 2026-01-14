# Vercel 环境变量配置指南

## 问题说明

当前部署失败原因：Vercel 项目缺少 Supabase 环境变量。

错误信息：
```
Error: supabaseUrl is required.
```

## 解决方案：添加环境变量到 Vercel

### 步骤 1：获取 Supabase 配置

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目（ecommerce-demo 相关的项目）
3. 点击左侧菜单 **Settings** → **API**
4. 复制以下两个值：

   - **Project URL**  
     格式：`https://xxxxxxxxxxxx.supabase.co`  
     ⚠️ 必须包含 `https://`，不要只复制 ID
   
   - **anon public key**  
     一个很长的字符串，以 `eyJ` 开头  
     ⚠️ 不是 service_role key，要用 anon/public key

### 步骤 2：添加环境变量到 Vercel

#### 方法 A：通过 Vercel Dashboard（推荐）

1. 访问：https://vercel.com/reres-projects-d8e20be5/ecommerce-demo/settings/environment-variables

2. 添加第一个环境变量：
   - **Key:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** 粘贴你的 Project URL（如 `https://abc123.supabase.co`）
   - **Environments:** 勾选 ✅ Production, ✅ Preview, ✅ Development
   - 点击 **Save**

3. 添加第二个环境变量：
   - **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** 粘贴你的 anon public key
   - **Environments:** 勾选 ✅ Production, ✅ Preview, ✅ Development
   - 点击 **Save**

#### 方法 B：通过 Vercel CLI（备选）

如果你更喜欢命令行，在项目目录执行：

```bash
cd /Users/wanghongjie/Way2AI/human3/ecommerce-demo

# 添加 SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# 粘贴你的 URL，按回车

vercel env add NEXT_PUBLIC_SUPABASE_URL preview
# 再次粘贴 URL

vercel env add NEXT_PUBLIC_SUPABASE_URL development
# 再次粘贴 URL

# 添加 SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# 粘贴你的 anon key，按回车

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
# 再次粘贴 key

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development
# 再次粘贴 key
```

### 步骤 3：触发重新部署

环境变量添加后，有两种方式触发部署：

#### 选项 A：通过 Vercel Dashboard

1. 访问：https://vercel.com/reres-projects-d8e20be5/ecommerce-demo
2. 点击最新的失败部署
3. 点击右上角的 **Redeploy** 按钮
4. 选择 **Redeploy** 确认

#### 选项 B：推送新 commit（自动触发）

```bash
cd /Users/wanghongjie/Way2AI/human3/ecommerce-demo
git commit --allow-empty -m "chore: redeploy with env vars"
git push
```

### 步骤 4：验证部署

1. 等待 2-3 分钟让 GitHub Actions 完成
2. 访问 [GitHub Actions](https://github.com/rerewang/ecommerce-demo/actions)
3. 确认 **Quality Check** ✅ 和 **Deploy to Vercel** ✅ 都通过
4. 访问你的 Vercel 部署 URL（在 Vercel Dashboard 可以看到）

---

## 常见问题

### Q: 如何确认环境变量已添加？

访问：https://vercel.com/reres-projects-d8e20be5/ecommerce-demo/settings/environment-variables

应该能看到：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

两个变量，每个都有 Production、Preview、Development 三个环境。

### Q: 添加后部署仍然失败？

1. 确认复制的是 **Project URL**（不是 Project Reference ID）
2. 确认复制的是 **anon public** key（不是 service_role key）
3. URL 必须包含 `https://` 前缀
4. 环境变量名称必须完全匹配（区分大小写）

### Q: 本地开发也需要这些变量吗？

是的。创建本地 `.env.local` 文件：

```bash
cd /Users/wanghongjie/Way2AI/human3/ecommerce-demo
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=你的URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的KEY
EOF
```

⚠️ `.env.local` 已在 `.gitignore` 中，不会被提交到 Git。

---

## 完成后的检查清单

- [ ] 从 Supabase Dashboard 复制了 Project URL
- [ ] 从 Supabase Dashboard 复制了 anon public key
- [ ] 在 Vercel 添加了 `NEXT_PUBLIC_SUPABASE_URL`
- [ ] 在 Vercel 添加了 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] 两个变量都勾选了所有环境（Production/Preview/Development）
- [ ] 触发了重新部署（Redeploy 或 push）
- [ ] GitHub Actions 的两个 job 都通过 ✅
- [ ] 访问 Vercel URL 确认网站正常运行

---

## 需要帮助？

如果完成上述步骤后仍有问题，提供以下信息：

1. Vercel 环境变量截图（URL 和 KEY 可以打码）
2. 最新的 GitHub Actions 运行日志
3. 具体的错误信息
