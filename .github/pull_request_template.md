## 摘要 (Summary)
<!-- 用1-2句话描述此PR的目的 -->



## 变更内容 (Changes)
<!-- 详细描述你做了什么改动 -->

- 
- 
- 

## 测试策略 (Test Strategy)
<!-- 描述你如何验证这些变更 -->

### TDD流程确认
- [ ] 所有新功能都先写了失败测试（RED阶段）
- [ ] 验证测试失败的原因符合预期
- [ ] 实现代码后测试通过（GREEN阶段）
- [ ] 进行了代码清理但保持测试绿色（REFACTOR阶段）

### Bug修复确认（如适用）
- [ ] 写了复现bug的测试（看到它失败）
- [ ] 修复bug后测试通过

## 完成前验证检查清单 (Verification Checklist)

在创建此PR前，我已经运行并确认以下命令全部通过：

### 本地验证
- [ ] `npm run lint` - ✓ No ESLint warnings or errors
- [ ] `npx tsc --noEmit` - ✓ No type errors
- [ ] `npm run test` - ✓ All unit tests pass (X/X)
- [ ] `npx playwright test` - ✓ All E2E tests pass (X passed)
- [ ] `npm run build` - ✓ Build successful

### CI验证
- [ ] GitHub Actions CI通过所有检查
- [ ] 查看了CI日志，确认没有warning

## 截图/录屏 (Screenshots/Recording)
<!-- 如果有UI变更，请提供截图或录屏 -->



## 相关Issue/PR
<!-- 引用相关的Issue或PR -->

Closes #
Related to #

## 部署注意事项 (Deployment Notes)
<!-- 是否需要环境变量更新、数据库迁移等 -->

- [ ] 无需特殊部署步骤
- [ ] 需要更新环境变量: 
- [ ] 需要数据库迁移: 
- [ ] 其他: 

## Review重点 (Review Focus)
<!-- 告诉reviewer重点关注哪些部分 -->



---

**提醒：** 根据 `AGENTS.md` 和 `Agent.md` 的规范：
- 不允许在没有失败测试的情况下编写实现代码
- 不允许在未运行完整验证的情况下声称完成
- 如果3次修复尝试失败，应该质疑架构而非继续修复
