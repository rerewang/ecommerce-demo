# Pre-commit Hooks Setup Guide

本项目使用 Husky 来强制执行代码质量检查。

## 安装

```bash
npm install --save-dev husky
npx husky install
```

## 配置的钩子

### pre-commit
在每次commit前自动运行：
- `npm run lint` - ESLint检查
- `npx tsc --noEmit` - TypeScript类型检查

### pre-push
在每次push前自动运行：
- `npm run test` - 单元测试
- `npm run build` - 构建验证

## 启用Hooks

在 `package.json` 中添加：

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

重新安装依赖：
```bash
npm install
```

## 跳过Hooks（紧急情况）

**警告：** 仅在紧急情况下使用，会绕过所有质量检查

```bash
git commit --no-verify -m "emergency fix"
git push --no-verify
```

## 为什么需要Pre-commit Hooks？

根据 `AGENTS.md` 的"完成前验证"规范：
- **提前发现问题**：在commit前而非CI失败后发现问题
- **节省时间**：避免push破坏性代码后等待CI失败
- **强制规范**：确保团队成员都遵循TDD和验证流程
- **防止遗忘**：自动化检查，不依赖人工记忆

## 故障排除

### Hook不执行
```bash
chmod +x .husky/*
npx husky install
```

### Hook执行失败
检查对应的命令是否在本地能正常运行。例如：
```bash
npm run lint
npx tsc --noEmit
```
