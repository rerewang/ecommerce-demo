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
- [x] **Performance**: 启用 `generateStaticParams` 实现 PDP 静态生成 (SSG)。
- [x] **Testing**:
    - Unit Tests: Service & Store 覆盖。
    - E2E Test: `e2e/buy-now.spec.ts` 验证完整购买流程。

## 待办事项 (Backlog)
- [ ] **Admin Dashboard**: 管理员后台支持编辑商品 JSON 元数据。
- [ ] **Reviews**: 商品评价系统。
- [ ] **Search**: 全局搜索功能。
- [ ] **User Profile**: 用户订单历史与个人信息管理。
