# 订单权限修复设计文档

**创建日期**: 2026-01-18  
**设计者**: AI Assistant  
**状态**: 待实施

---

## 📋 问题定义

### 当前问题
1. 用户访问 `/orders` 页面无法查看自己的订单
2. 管理员访问 `/admin/orders` 页面无法查看任何订单

### 根本原因
1. `getUserOrders()` 函数没有按 `user_id` 过滤数据
2. Service 层使用匿名 Supabase 客户端，未传递用户认证 session
3. 虽然 RLS 策略已配置，但因缺少认证上下文而无法生效

---

## 🎯 设计目标

### 功能目标
- 普通用户可以查看**自己的**订单列表
- 管理员可以查看**所有用户的**订单列表
- 支持订单状态筛选（pending, paid, shipped, cancelled）

### 安全目标
- **深度防御架构**：应用层 + 数据库层双重权限验证
- 防止用户查看他人订单
- 防止权限提升攻击
- 即使应用层有 bug，数据库 RLS 也能保护数据

---

## 🏗️ 架构设计

### 整体架构（Defense in Depth）

```
┌─────────────────────────────────────────┐
│  前端层 (Browser)                        │
│  - Server Component（服务端渲染）        │
│  - 不做安全决策                          │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  应用层 (Service Layer)                  │
│  ✅ 第一道防线                           │
│  - 身份验证（userId 存在？）             │
│  - 授权检查（role 是否有权限？）          │
│  - 显式过滤（.eq('user_id', userId)）   │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  数据库层 (PostgreSQL + RLS)             │
│  ✅ 第二道防线（最后防线）                │
│  - RLS 策略自动验证                      │
│  - 即使应用层有 bug 也能拦截              │
└─────────────────────────────────────────┘
```

### 数据流设计

#### 用户订单列表流程
```
用户访问 /orders
    ↓
Server Component (page.tsx)
    ↓
1. createServerClient() - 获取带 session 的 Supabase 客户端
2. supabase.auth.getUser() - 验证登录状态
3. 获取 userId 和 role
    ↓
调用 Service 层
getUserOrders(userId, role)
    ↓
Service 层权限检查：
  ✅ if (!userId) throw Error('未登录')
  ✅ if (role !== 'customer' && role !== 'admin') throw Error('无效角色')
  ✅ 添加过滤: .eq('user_id', userId)
    ↓
数据库查询（带认证 token）
    ↓
RLS 二次验证：
  - 验证 auth.uid() = user_id
    ↓
返回数据到 Server Component
    ↓
渲染订单列表（服务端渲染，无客户端 JS）
```

#### 管理员订单管理流程
```
管理员访问 /admin/orders?status=paid
    ↓
Server Component (已存在)
    ↓
1. createServerClient()
2. 验证管理员身份
    ↓
调用 Service 层
getOrders(userId, 'admin', 'paid')
    ↓
Service 层权限检查：
  ✅ if (role !== 'admin') throw Error('Unauthorized')
  ✅ 不添加 user_id 过滤（管理员看全部）
  ✅ 添加状态过滤: .eq('status', 'paid')
    ↓
数据库查询
    ↓
RLS 验证管理员权限：
  - 验证 profiles.role = 'admin'
    ↓
返回所有用户的已支付订单
    ↓
渲染管理面板
```

---

## 🔧 技术实现

### 需要修改的文件

#### 1. `src/lib/supabase.ts`（新增函数）

**新增内容**：
```typescript
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerClient() {
  const cookieStore = await cookies()
  
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

**作用**：创建带认证上下文的服务端 Supabase 客户端

---

#### 2. `src/services/orders.ts`（重构）

**修改前**：
```typescript
export async function getUserOrders(): Promise<Order[]> {
  return getOrders()  // ❌ 没有过滤，没有认证
}

export async function getOrders(status?: OrderStatus): Promise<Order[]> {
  const { data } = await supabase  // ❌ 匿名客户端
    .from('orders')
    .select('*')
  return data
}
```

**修改后**：
```typescript
export async function getUserOrders(
  userId: string, 
  role: string
): Promise<Order[]> {
  // ✅ 第一道防线：身份验证
  if (!userId) {
    throw new Error('Authentication required')
  }
  
  // ✅ 第一道防线：授权检查
  const validRoles = ['admin', 'customer']
  if (!validRoles.includes(role)) {
    throw new Error('Invalid role')
  }
  
  // ✅ 显式过滤（非管理员）
  let query = supabase
    .from('orders')
    .select(`
      *,
      items:order_items (
        *,
        product:products (*)
      )
    `)
    .order('created_at', { ascending: false })
  
  if (role !== 'admin') {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data || []
}

export async function getOrders(
  userId: string,
  role: string,
  status?: OrderStatus
): Promise<Order[]> {
  // ✅ 管理员权限检查
  if (role !== 'admin') {
    throw new Error('Unauthorized: Admin only')
  }
  
  // 调用 getUserOrders 复用逻辑
  const orders = await getUserOrders(userId, role)
  
  // 按状态过滤
  if (status) {
    return orders.filter(order => order.status === status)
  }
  
  return orders
}
```

---

#### 3. `src/app/orders/page.tsx`（重构为 Server Component）

**修改前**：
```typescript
// Client Component
export default function OrdersPage() {
  return <OrderList />  // ❌ 客户端获取数据
}
```

**修改后**：
```typescript
import { createServerClient } from '@/lib/supabase'
import { getUserOrders } from '@/services/orders'
import { redirect } from 'next/navigation'
import { OrderCard } from '@/components/orders/OrderCard'
import { Button } from '@/components/ui/Button'

export default async function OrdersPage() {
  // ✅ 服务端认证
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect=/orders')
  }
  
  const userId = user.id
  const role = user.user_metadata?.role || 'customer'
  
  // ✅ 调用 Service 层
  const orders = await getUserOrders(userId, role)
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">我的订单</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="mb-6">暂无订单</p>
          <Button href="/">去逛逛</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
```

**变更说明**：
- 删除 `OrderList` 客户端组件
- 改为 Server Component（async function）
- 在服务端获取认证信息
- 直接渲染数据（无客户端 JS 加载）

---

#### 4. `src/app/admin/orders/page.tsx`（修改）

**修改部分**：
```typescript
export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const { status } = await searchParams
  
  // ✅ 新增：获取认证信息
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect=/admin/orders')
  }
  
  const userId = user.id
  const role = user.user_metadata?.role || 'customer'
  
  // ✅ 修改：传递认证信息给 Service 层
  const validStatus = ['pending', 'paid', 'shipped', 'cancelled'].includes(status || '') 
    ? (status as OrderStatus) 
    : undefined
    
  const orders = await getOrders(userId, role, validStatus)
  
  // ... 其余保持不变
}
```

---

## 🧪 测试策略

### 单元测试（Vitest）

**文件**: `src/services/orders.test.ts`

```typescript
describe('getUserOrders', () => {
  test('未登录时抛出错误', async () => {
    await expect(getUserOrders('', 'customer')).rejects.toThrow('Authentication required')
  })
  
  test('无效角色时抛出错误', async () => {
    await expect(getUserOrders('user-123', 'invalid')).rejects.toThrow('Invalid role')
  })
  
  test('普通用户只能看到自己的订单', async () => {
    const orders = await getUserOrders('user-123', 'customer')
    expect(orders.every(o => o.userId === 'user-123')).toBe(true)
  })
  
  test('管理员可以看到所有订单', async () => {
    const orders = await getUserOrders('admin-456', 'admin')
    const userIds = new Set(orders.map(o => o.userId))
    expect(userIds.size).toBeGreaterThan(1)
  })
})

describe('getOrders', () => {
  test('非管理员调用时抛出错误', async () => {
    await expect(getOrders('user-123', 'customer')).rejects.toThrow('Unauthorized')
  })
  
  test('管理员可以按状态过滤订单', async () => {
    const orders = await getOrders('admin-456', 'admin', 'paid')
    expect(orders.every(o => o.status === 'paid')).toBe(true)
  })
})
```

### E2E 测试（Playwright）

**文件**: `e2e/orders-permission.spec.ts`

```typescript
test('普通用户只能看到自己的订单', async ({ page }) => {
  await login(page, 'user@example.com', 'password')
  await page.goto('/orders')
  
  const orderCards = page.locator('[data-testid="order-card"]')
  await expect(orderCards).toHaveCount(2)  // user 有 2 个订单
})

test('管理员可以看到所有订单', async ({ page }) => {
  await login(page, 'admin@example.com', 'password')
  await page.goto('/admin/orders')
  
  const rows = page.locator('[data-testid="order-row"]')
  await expect(rows.count()).toBeGreaterThan(5)  // 多个用户的订单
})

test('未登录用户被重定向', async ({ page }) => {
  await page.goto('/orders')
  await expect(page).toHaveURL('/login?redirect=/orders')
})
```

---

## ⚠️ 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| RLS 策略失效 | 数据泄露 | 应用层显式过滤作为双重保险 |
| Session 过期 | 用户体验差 | 自动重定向到登录页 + redirect 参数 |
| 性能下降 | 页面加载慢 | Server Component + 数据库索引已存在 |
| Breaking Change | 影响现有功能 | 运行完整测试套件（35 tests + 新增测试） |

---

## 🚀 实施步骤（TDD）

### Phase 1: 基础设施
1. ✅ 创建 `createServerClient()` 函数
2. ✅ 添加测试数据（3 用户 + 多个订单）

### Phase 2: Service 层（TDD）
1. 🔴 写 `getUserOrders()` 测试
2. 🟢 实现权限检查逻辑
3. 🔴 写 `getOrders()` 测试
4. 🟢 实现管理员权限检查

### Phase 3: Server Component（TDD）
1. 🔴 写集成测试
2. 🟢 重构 `/orders/page.tsx`
3. 🟢 修改 `/admin/orders/page.tsx`

### Phase 4: E2E 验证
1. 🔴 写 E2E 测试
2. 🟢 运行完整测试套件
3. 🔵 重构优化

### Phase 5: 完整验证
- `npm run lint` ✅
- `npx tsc --noEmit` ✅
- `npm run test` ✅
- `npx playwright test` ✅
- `npm run build` ✅

---

## 📊 成功标准

### 功能验证
- ✅ 普通用户访问 `/orders` 看到自己的订单
- ✅ 管理员访问 `/admin/orders` 看到所有订单
- ✅ 未登录用户被重定向到登录页
- ✅ 普通用户无法查看他人订单

### 测试验证
- ✅ 所有现有测试（35 tests）继续通过
- ✅ 新增至少 8 个单元测试全部通过
- ✅ 新增至少 3 个 E2E 测试全部通过

### 性能验证
- ✅ 订单列表页面加载时间 < 2s
- ✅ 管理后台加载时间 < 3s

---

## 🔄 未来扩展

### 数据库迁移兼容性
如果未来迁移到 MySQL：
- RLS 失效 → 应用层过滤依然有效
- 只需移除 RLS 相关代码
- Service 层逻辑无需修改

### 功能扩展
- 订单搜索（按订单号、商品名）
- 订单导出（CSV、Excel）
- 订单分页（超过 50 个订单时）
- 订单状态变更通知

---

## 📝 变更日志

- **2026-01-18**: 初始设计文档创建

