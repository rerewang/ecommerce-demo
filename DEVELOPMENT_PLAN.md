# E-commerce Demo 开发计划

基于 UI/UX Pro Max 设计系统 + Superpowers 系统化开发

**项目路径：** `/Users/wanghongjie/Way2AI/human3/ecommerce-demo`

---

## 🎨 设计系统（来自 UI/UX Pro Max）

### 核心设计决策

**UI风格：** Soft UI Evolution + Minimalism
- 现代、专业、可访问性好
- 适合电商平台
- WCAG AA+ 标准
- 性能优秀

**颜色方案：**
```css
/* Primary - Soft Blue */
--color-primary-50: #f0f9ff;
--color-primary-100: #e0f2fe;
--color-primary-500: #87CEEB;
--color-primary-600: #0ea5e9;
--color-primary-900: #0c4a6e;

/* Success - Soft Green */
--color-success: #90EE90;
--color-success-dark: #10b981;

/* Background */
--bg-light: #ffffff;
--bg-glass: rgba(255, 255, 255, 0.8);

/* Text */
--text-primary: #0F172A;  /* slate-900 */
--text-secondary: #475569; /* slate-600 */
```

**字体配对：** Modern Professional
- **标题：** Poppins (geometric, modern)
- **正文：** Open Sans (humanist, readable)
- Google Fonts Import:
```css
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
```

**动画规范：**
- Transition: 200-300ms
- Smooth, modern
- Focus visible (WCAG AA)

---

## 📋 7天开发计划

### Day 1: 项目设置 + 设计系统（今天）

**目标：** 搭建基础设施，配置设计系统

**任务清单：**
- [x] 创建 Next.js 项目
- [ ] 安装依赖（Supabase, Zustand, Lucide Icons）
- [ ] 配置 Tailwind CSS（字体、颜色）
- [ ] 创建设计系统文件（`src/styles/design-system.css`）
- [ ] 设置 Supabase 项目
- [ ] 创建 Supabase 客户端
- [ ] 测试运行（`npm run dev`）

**AI辅助工具：**
- Cursor：80%代码生成
- Superpowers：verification-before-completion

**预计时间：** 2-3小时

---

### Day 2: 数据库设计 + 基础组件

**目标：** 设计数据库schema，创建可复用组件

**数据库Schema（Supabase）：**
```sql
-- 商品表
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 示例数据
INSERT INTO products (name, description, price, image_url, stock) VALUES
('iPhone 15 Pro', '最新款iPhone', 7999.00, 'https://via.placeholder.com/400', 50),
('MacBook Pro', '14英寸M3芯片', 14999.00, 'https://via.placeholder.com/400', 30),
('AirPods Pro', '主动降噪耳机', 1999.00, 'https://via.placeholder.com/400', 100);
```

**基础组件（使用 Soft UI Evolution 风格）：**
```typescript
// src/components/ui/Button.tsx
// src/components/ui/Input.tsx
// src/components/ui/Card.tsx
```

**设计规范：**
- 使用 Improved shadows（柔和但清晰）
- 200-300ms transition
- Focus visible rings
- WCAG AA+ contrast

**AI辅助：**
- 用 Cursor 生成组件基础代码
- 用 UI/UX Pro Max 验证设计规范

**预计时间：** 3-4小时

---

### Day 3: 商品列表页

**目标：** 完成商品展示页面

**页面结构：**
```
/app/page.tsx
├── Navbar（顶部导航）
├── Hero Section（可选）
├── ProductGrid（商品网格）
│   └── ProductCard × N
└── Footer
```

**ProductCard设计（Soft UI风格）：**
- 柔和阴影：`shadow-md hover:shadow-lg`
- 圆角：`rounded-xl`
- 过渡：`transition-all duration-300`
- 图片：Next.js Image 组件（fill + object-cover）
- 交互：hover时轻微上升（`hover:-translate-y-1`）

**响应式：**
- 手机：1列
- 平板：2列
- 桌面：3-4列

**AI辅助：**
- Cursor 生成组件
- Superpowers: test-driven-development（先写测试）

**预计时间：** 3-4小时

---

### Day 4: 商品详情页 + 购物车状态管理

**目标：** 商品详情 + Zustand 购物车

**路由：** `/products/[id]`

**页面元素：**
- 大图展示
- 商品信息
- 价格
- 库存
- "加入购物车"按钮

**购物车状态（Zustand）：**
```typescript
// src/store/cartStore.ts
interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url: string
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
}
```

**AI辅助：**
- Cursor 生成状态管理代码
- Superpowers: systematic-debugging（调试状态问题）

**预计时间：** 3-4小时

---

### Day 5: 购物车UI + 结算页面

**目标：** 购物车抽屉 + 简单结算

**购物车抽屉（Drawer/Sheet）：**
- 右侧滑出
- 显示购物车商品
- 数量调整
- 删除商品
- 总价计算
- "去结算"按钮

**结算页面：** `/checkout`
- 商品列表
- 总价
- 简单表单（姓名、地址）
- "提交订单"按钮（模拟，不真实支付）

**设计规范：**
- 使用 glassmorphism 效果（`bg-white/80 backdrop-blur-lg`）
- 平滑过渡动画
- 清晰的CTA按钮（Success Green）

**AI辅助：**
- UI/UX Pro Max: 搜索 "animation" UX最佳实践
- Cursor 生成动画代码

**预计时间：** 3-4小时

---

### Day 6: 后台管理（简单版）

**目标：** 简单的商品管理后台

**路由：** `/admin`

**功能：**
- 商品列表（表格）
- 添加商品（表单）
- 编辑商品
- 删除商品

**设计：**
- 使用 Data-Dense 风格（来自 UI/UX Pro Max）
- 表格布局
- 清晰的操作按钮

**AI辅助：**
- Cursor 生成 CRUD 代码
- Superpowers: verification-before-completion

**预计时间：** 3-4小时

---

### Day 7: 优化 + 部署

**目标：** 性能优化 + Vercel部署

**优化清单：**
- [ ] 图片优化（Next.js Image）
- [ ] 代码分割
- [ ] SEO优化（metadata）
- [ ] 响应式测试
- [ ] 可访问性检查（WCAG AA）
- [ ] 性能测试（Lighthouse）

**部署到Vercel：**
```bash
npm run build
vercel --prod
```

**AI辅助：**
- Superpowers: verification-before-completion
- UI/UX Pro Max: 搜索 "accessibility" 最佳实践

**预计时间：** 2-3小时

---

## 🛠️ 技术栈

**前端：**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS（Soft UI Evolution风格）
- Zustand（状态管理）
- Lucide React（图标）

**后端：**
- Supabase（数据库 + Auth）
- PostgreSQL

**部署：**
- Vercel

**AI工具：**
- Cursor（80%代码生成）
- Superpowers（系统化开发）
- UI/UX Pro Max（设计决策）

---

## 📂 项目结构

```
ecommerce-demo/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout（应用字体）
│   │   ├── page.tsx            # 首页（商品列表）
│   │   ├── products/
│   │   │   └── [id]/page.tsx  # 商品详情
│   │   ├── checkout/
│   │   │   └── page.tsx       # 结算页面
│   │   └── admin/
│   │       └── page.tsx       # 后台管理
│   ├── components/
│   │   ├── ui/                # 基础组件
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Sheet.tsx
│   │   ├── ProductCard.tsx    # 商品卡片
│   │   ├── ProductGrid.tsx    # 商品网格
│   │   ├── Navbar.tsx         # 导航栏
│   │   ├── CartDrawer.tsx     # 购物车抽屉
│   │   └── Footer.tsx         # 页脚
│   ├── lib/
│   │   ├── supabase.ts        # Supabase客户端
│   │   └── utils.ts           # 工具函数（cn, formatCurrency）
│   ├── store/
│   │   └── cartStore.ts       # Zustand购物车状态
│   └── styles/
│       ├── globals.css        # 全局样式
│       └── design-system.css  # 设计系统变量
├── public/
│   └── images/                # 静态图片
├── .env.local                 # 环境变量（Supabase密钥）
└── tailwind.config.ts         # Tailwind配置（字体、颜色）
```

---

## 🎯 成功标准

**MVP完成标准：**
- [ ] 商品列表页正常展示（至少3个商品）
- [ ] 商品详情页可访问
- [ ] 购物车功能正常（增删改查）
- [ ] 后台可以管理商品
- [ ] 响应式设计（手机+桌面）
- [ ] 部署到Vercel可访问

**设计质量标准（UI/UX Pro Max）：**
- [ ] 使用正确的字体（Poppins + Open Sans）
- [ ] 颜色对比度 WCAG AA+
- [ ] 动画流畅（200-300ms）
- [ ] 无emoji图标（使用Lucide Icons）
- [ ] 一致的阴影和圆角
- [ ] hover状态清晰（cursor-pointer）

**性能标准：**
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] 首屏加载 < 3s

---

## 🚀 如何使用Superpowers

### 1. 开始新功能前

**使用：** `writing-plans` skill
```
创建详细开发计划
列出所有步骤
估算时间
```

### 2. 开发过程中遇到bug

**使用：** `systematic-debugging` skill
```
1. 重现问题
2. 隔离原因
3. 验证修复
4. 防止回归
```

### 3. 完成功能后

**使用：** `verification-before-completion` skill
```
1. 功能测试
2. 代码审查
3. 性能检查
4. 可访问性验证
```

### 4. 准备提交代码

**使用：** `requesting-code-review` skill
```
准备清晰的PR描述
列出改动点
自我审查checklist
```

---

## 📱 如何使用UI/UX Pro Max

### 需要设计决策时

```bash
# 搜索样式推荐
python3 ~/.config/opencode/skills/ui-ux-pro-max/scripts/search.py "glassmorphism card" --domain style

# 搜索颜色方案
python3 ~/.config/opencode/skills/ui-ux-pro-max/scripts/search.py "primary accent" --domain color

# 搜索UX最佳实践
python3 ~/.config/opencode/skills/ui-ux-pro-max/scripts/search.py "animation" --domain ux

# Next.js专项指南
python3 ~/.config/opencode/skills/ui-ux-pro-max/scripts/search.py "image" --stack nextjs
```

---

## ⚡ 立刻开始（Day 1任务）

**现在执行：**

1. 进入项目目录
2. 安装依赖
3. 配置Tailwind
4. 设置Supabase
5. 测试运行

准备好了就告诉我："开始Day 1"！
