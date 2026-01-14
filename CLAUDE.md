# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 提供代码库操作指导。

## 语言

与用户通过中文沟通。

## 常用命令

```bash
npm run dev          # 启动开发服务器 (http://localhost:3000)
npm run build        # 构建生产版本（提交前必须运行）
npm run start        # 启动生产服务器
npm run lint         # 运行 ESLint
npm run test         # 运行 Vitest 单元测试
npx playwright test  # 运行 E2E 测试
```

## 项目架构

Next.js 电商演示项目，Supabase 后端：

```
src/app/              # 页面路由（App Router，默认 Server Components）
src/components/       # UI 组件（需要交互时用 Client Components）
  ui/                 # 设计系统组件（Button, Card, Input）
  auth/               # 登录/认证表单
  cart/               # 购物车组件
  checkout/           # 结账流程
  products/           # 商品列表/详情
src/lib/              # 工具函数 + Supabase 客户端
src/services/         # 数据获取层
src/store/            # Zustand 状态管理（购物车持久化）
src/types/            # TypeScript 类型定义
middleware.ts         # 认证 + RBAC 权限保护（admin 路由）
```

## 数据流

`React 组件` → `Zustand Store (购物车)` → `Supabase Client` → `PostgreSQL (启用 RLS)`

## 安全

- `/admin` 路由：中间件保护 + `profiles.role='admin'` 权限检查
- 所有数据库表启用 RLS（行级安全策略）
- 环境变量存储在 `.env.local` (NEXT_PUBLIC_SUPABASE_*)

## TDD 工作流（严格）

1. 先写失败的测试（Vitest 单元/集成测试）
2. 实现代码
3. 运行 `npm run build` 捕获 Server/Client 边界问题
4. 关键流程（结账、登录、管理员）编写 Playwright E2E 测试
5. 使用 MCP Playwright 验证

**Bugfix 原则**：修复前先用测试用例复现问题。

## 设计系统

Soft UI Evolution 风格：柔和阴影、圆角、200-300ms 悬停过渡动画。
