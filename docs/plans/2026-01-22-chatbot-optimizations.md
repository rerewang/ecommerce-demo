# Chatbot Optimization Plan

**Date:** 2026-01-22
**Status:** In Progress (latest update: server-side search + summary block delivered)
**Context:** Refinements for the AI Customer Service Chatbot after initial Vercel AI SDK integration.

## 0. Critical Fix Verification (Immediate)
- [x] **Ensure tool execution + final text**: 已改为服务端先查产品并注入 `:::products [...] :::`，模型只做总结，流以 `finishReason=stop` 结束。
  - *Test Case*: "Find me oil paintings under $100" -> 返回 2 条样例油画卡片 + 简短总结文本（已通过 curl 验证）。

## Optimization Roadmap (Prioritized)

### 1. Error Handling UI
- [x] 实现错误提示与 Retry 按钮（ChatWidget 现有）。
- [ ] 网络离线态专项处理（待补充）。

### 2. Streaming Control
- [x] `stop()` 按钮（已存在）。
- [x] `regenerate()` 按钮（已存在）。

### 3. Input Validation
- [x] 输入防抖 200ms（已实现）。
- [x] 阻止空白提交（已实现）。
- [ ] 提交按钮禁用态视觉反馈（待补充）。

### 4. Markdown/HTML Safety
- [x] `rehype-sanitize` 启用，基础 Markdown 渲染已验证。
- [ ] 更全面的列表/代码块渲染验证（待补充）。

### 5. Tool Invocation Consistency
- [x] 统一卡片渲染：通过 `:::products [...] :::` 嵌入，前端解析为卡片。
- [x] 历史持久化：messages 仍保存 localStorage；卡片数据从内容解析。
- [x] 避免 JSON 闪现：后端不再直返 raw JSON 给用户。

### 6. Message Persistence
- [x] localStorage 持久化与恢复（已有）。
- [ ] 清空对话按钮（待补充）。

## Low Priority (Backlog)
- [ ] Multi-model switching (runtime).
- [ ] 提示词防护，如何不暴露自己的提升词
- [ ] widget 在流式响应时，UI会有频繁闪烁的问题
- [ ] widget 在流式响应时，如果渲染内容为 Html之类的内容，比如商品卡片，在内容渲染完成之前，UI会产生将文本展示出来的问题，对用户体验不友好
- [ ] widget 对话框应该支持放大，可以提供一个展开的模式
- [ ] widget 对话应该支持复制



## TEST Cases
1) 聊天交互与工具调用
- 打开前端 Widget，输入 “Find oil paintings under $100”。
- 期望：出现工具结果卡片（至少 2 条样例油画）+ 简短总结文本（finish=stop），无报错。
- 点击 Stop（在流式时）/ Regenerate（结束后）按钮，验证能中断和重生成。
2) 错误与重试
- 断网或临时改错 API 地址（可选），触发错误后应显示红色错误提示和 Retry 按钮；点击 Retry 能重新发送。
3) 输入校验与防抖
- 尝试提交空白输入，按钮应禁用且无请求。
- 快速输入多次，防抖 200ms，应只发送一次（可通过观察请求次数）。
4) Markdown/安全渲染
- 给出含 Markdown 链接/列表的回复（或通过模拟）查看渲染，无危险 HTML；代码块用浅色背景显示。
5) 工具结果一致性
- 当工具返回空结果（可输入非常苛刻的条件），前端应显示“未找到…建议调整预算/关键词”的提示；有结果时统一卡片样式。
6) 消息持久化
- 聊天后刷新页面，历史对话应从 localStorage 恢复（同一浏览器下验证）。
7) 后端快速自测（可选）
- curl -v http://localhost:3000/api/chat with body {"messages":[{"role":"user","content":"Find oil paintings under $100"}]}；确认返回包含 tool-output（fallback 样例）且 finishReason=stop 或有总结文本。
