# Chatbot Remaining Work & Best Practices

**Date:** 2026-01-23  
**Status:** V1 Complete (Optimization Phase)

## 1. Remaining Tasks (Prioritized)

### Group A — Ready to Build (AI Chatbot 内，短期落地)
1. **退换助手（只读 + 政策引用）**
   - 资格校验硬规则（日期/品类/状态），LLM 仅做解释与引用。
   - 工具：`getOrders` / `getOrderItems` / `checkReturnEligibility` / `createReturnTicket`（仅生成工单/请求，不直接退款）。
2. **订单跟踪 + 延迟建议（只读）**
   - 工具：`getOrderStatus`（timeline/ETA/carrier/isDelayed）；可选 `createSupportTicket`。
   - 延迟时列出允许操作（后端策略决定），不自动执行。
3. **价格/库存提醒（站内通知版）**
   - 工具：`createAlert` / `listAlerts` / `deleteAlert`；定时任务监听价格/库存变化；先做站内通知。

### Group B — Defer / 需配合其他功能
1. **Cart Copilot（含优惠券/改价/改货）**
   - 原因：目前无优惠券功能；待优惠与购物车改写能力上线后一并实现。
2. **CompareProducts（对比器）**
   - 原因：需字段规范化与对比表，优先级靠后。

### Group C — Deferred to V2 (Feature Extensions)
这些需要较大架构/后端能力升级。

1. **流式响应 UI 闪烁 (Streaming Flicker)** → 迁移 Data Stream Protocol（文本流与数据分离）。
2. **真正的 RAG / 向量检索** → `pgvector` + 语义搜索。
3. **多模型切换 (Multi-model Switching)** → 运行时选模型（Fast/Smart）。
4. **自动化 E2E 异常测试** → 复杂的网络/超时模拟。
5. **SearchProducts 增强 (Advanced Filtering)** → 分页、排序、风格/材质过滤。
6. **多轮澄清 (Multi-turn Clarification)** → Agentic 循环，在信息不足时先澄清再搜索。

---

## 2. Issues & Best Practices

### Issue: Streaming Content Flicker (JSON/Data Leak)
**Solution**: 采用 Data Stream Protocol，将数据与文本分离；前端从 data channel 渲染卡片，text channel 仅展示文案。

### Issue: Prompt Injection
**Solution (已实现)**: System Prompt 中加入拒绝/防护指令，身份锁定，Sandwich Defense。

---

## 3. Test Cases (已完成功能示例)

### Test Case 1: Image Fallback
1) Mock 返回 `image_url: "invalid.jpg"` → 打开 Chat 搜索；应显示占位图而非裂图。

### Test Case 2: Disabled Button State
1) 输入为空 → 发送按钮变灰、不可点击。  
2) AI 正在生成 → 按钮显示 Spinner，保持禁用。
