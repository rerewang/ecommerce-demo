# 项目进度追踪 (Project Tracking)

## 2026-01-19 PDP Overhaul & Direct Buy (Completed)
- [x] **Data Layer**: 数据库 `products` 表新增 `metadata` (JSONB) 字段，支持动态属性与规格。
- [x] **Service Layer**: 升级 `getProducts` 支持解析 JSON 元数据。
- [x] **Store**: 新增 `useCheckoutStore` (Zustand + Persist) 支持“立即购买”流程。
- [x] **UI Enhancements**:
    - [x] **Variant Selector**: 动态规格选择器（颜色、尺寸等）。
    - [x] **Product Features**: 动态属性参数表。
    - [x] **Service Badges**: 服务保障标签（包邮、退换）。
    - [x] **Buy Now**: 立即购买按钮，直通结账页。
    - [x] **Loading**: 骨架屏优化加载体验。
    - [x] **Search/Filter**: 商品搜索与分类筛选 (`ProductFilterBar`)。
- [x] **Performance**: 启用 `generateStaticParams` 实现 PDP 静态生成 (SSG)。
- [x] **Testing**:
    - Unit Tests: Service & Store 覆盖。
    - E2E Test: `e2e/buy-now.spec.ts` 验证完整购买流程。

## 2026-01-20 Admin Dashboard V2 (Completed)
- [x] **Metadata Editor**: 支持 Features/Variants 向导模式及 Raw JSON 编辑。
- [x] **Product Form Integration**: 在创建/编辑商品时无缝集成元数据编辑。

## 2026-01-22 Chatbot Optimization (Completed)
- [x] **UI & Interaction**:
    - [x] **Streaming**: Vercel AI SDK 实时流式响应。
    - [x] **Loading States**: 优化加载与闪烁问题 (Stream flickering fix)。
    - [x] **Offline Mode**: 离线状态检测与提示。
    - [x] **Suggestions**: 空状态下的建议问题 (Suggested Questions)。
    - [x] **UI Enhancements**: 
        - [x] **Expand Mode**: 支持最大化/最小化 Widget。
        - [x] **Copy Message**: 支持一键复制 AI 回复。
        - [x] **Disabled State**: 提交按钮的禁用/加载状态视觉反馈。
- [x] **Tool Usage**:
    - [x] **Server-side Injection**: 后端搜索商品并注入 Context，避免客户端 Tool Call 失败。
    - [x] **Product Cards**: 解析响应中的 `:::products` 标记并渲染为交互卡片。
    - [x] **Image Fallback**: 商品图片加载失败时自动显示占位图。
- [x] **Persistence**: 基于 LocalStorage 的消息历史持久化及清空功能。
- [x] **Security**:
    - [x] **Prompt Protection**: 防止 Prompt Injection 攻击。
    - [x] **Key Safety**: 确认 API Headers 未泄露 Supabase Key。

## 待办事项 (Backlog)
- [ ] **Chatbot V2**:
    - [ ] **RAG**: 接入向量知识库。
    - [ ] **Multi-model**: 支持多模型切换。
    - [ ] **Advanced Search**: 分页、排序、多轮澄清。
- [ ] **Reviews**: 商品评价系统。
- [ ] **Global Search**: 全局导航栏搜索 (当前仅有商品列表页筛选)。
- [~] **User Profile**: 
    - [x] **My Orders**: 基础订单列表已实现 (`src/app/(shop)/orders`).
    - [ ] **Profile Management**: 个人信息修改、地址管理待实现。
- [ ] **Mobile Optimization**:
    - [ ] **Sticky Buy Button**: PDP 页面的吸底购买按钮。
    - [ ] **Admin Table Card View**: 管理后台表格在移动端的卡片式适配。
