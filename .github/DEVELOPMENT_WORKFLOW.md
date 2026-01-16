# 开发流程规范

## 工作流程

### 1️⃣ 你创建 Issue

在 GitHub 创建 Issue，包含：
- **标题**：清晰描述功能
- **任务清单**：具体的开发任务
- **验收标准**：完成的判断标准

示例：
```markdown
## 任务
- [ ] 创建 orders 表
- [ ] 创建 order_items 表
- [ ] 添加 RLS 策略

## 验收标准
- 数据库迁移文件可执行
- RLS 策略测试通过
```

### 2️⃣ 我开始工作

你在对话中 @mention issue 或告诉我 issue 编号，我会：

1. **创建功能分支**：`feature/issue-{number}-{description}`
2. **实现功能**：按照 issue 的任务清单逐项完成
3. **运行验证**：
   - `npm run build` - 确保编译通过
   - `npm run lint` - 代码规范检查
   - `npm run test` - 单元测试（如有）
4. **提交代码**：使用规范的 commit message
5. **创建 PR**：
   - 标题：`feat: {issue 描述}`
   - 正文：引用 issue (`Closes #{number}`)
   - 包含改动总结

### 3️⃣ 你审查 & 合并

- 查看 PR 的代码改动
- 测试功能是否符合预期
- 合并 PR 或提出修改意见

---

## Commit Message 规范

```
<type>: <subject>

<body>
```

**Type**:
- `feat`: 新功能
- `fix`: 修复 bug
- `refactor`: 重构
- `docs`: 文档
- `test`: 测试
- `chore`: 构建/工具

**示例**:
```
feat: implement order creation service

- Add createOrder function with transaction support
- Add stock validation and decrement
- Add error handling for insufficient stock

Closes #3
```

---

## 分支命名

```
feature/issue-{number}-{short-description}
```

示例：
- `feature/issue-1-orders-database`
- `feature/issue-3-order-service`

---

## PR 模板

```markdown
## 关联 Issue
Closes #{issue_number}

## 改动说明
- 添加了 X 功能
- 重构了 Y 模块
- 修复了 Z 问题

## 测试
- [ ] 本地测试通过
- [ ] Build 成功
- [ ] Lint 通过

## 截图/演示
（如果是 UI 改动）
```

---

## 快速命令参考

```bash
# 开发服务器
npm run dev

# 构建验证
npm run build

# 代码检查
npm run lint

# 运行测试
npm run test

# E2E 测试
npx playwright test
```
