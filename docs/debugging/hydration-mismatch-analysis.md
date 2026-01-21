# Hydration Mismatch Investigation - Update

## Analysis of `src/components/cart/CartBadge.tsx`

The current implementation ATTEMPTS to handle hydration but does it incorrectly:

```typescript
  const [mounted, setMounted] = useState(false)
  const totalItems = useCartStore(state => state.getTotalItems())
  
  if (typeof window !== 'undefined' && !mounted) {
    setMounted(true)
  }

  const displayCount = mounted ? totalItems : 0
```

**The Problem:**
Calling `setMounted(true)` during render (in the function body) is risky. React warns against updating state during render.
More importantly, `typeof window !== 'undefined'` is `true` on the client *during hydration*.
So `setMounted(true)` happens *during* the initial client render pass.
This effectively makes `displayCount` equal to `totalItems` *immediately* on the client.
But on the Server, `mounted` is `false`, so `displayCount` is `0`.

**Result:**
- Server HTML: `displayCount = 0` (No badge)
- Client HTML (Hydration): `displayCount = totalItems` (Has badge) -> **Mismatch!**

**Correct Pattern:**
We must ensure `mounted` stays `false` until *after* the initial hydration render is complete.
We should use `useEffect` to set `mounted`.

```typescript
  const [mounted, setMounted] = useState(false)
  const totalItems = useCartStore(state => state.getTotalItems())

  useEffect(() => {
    setMounted(true)
  }, [])

  const displayCount = mounted ? totalItems : 0
```

On server: `useEffect` doesn't run. `mounted` is false.
On client hydration: `useEffect` doesn't run *yet*. `mounted` is false.
Client & Server match (both 0).
After hydration: `useEffect` runs, sets `mounted` to true. Re-render happens with correct count.

## Plan
1. Refactor `CartBadge.tsx` to use `useEffect` for the mounted check.
2. Remove the `if (typeof window ...)` block.
3. Import `useEffect`.
