# Hydration Mismatch Investigation

## 1. Error Analysis
**Error:** `Hydration failed because the server rendered HTML didn't match the client.`
**Location:** `src/components/cart/CartBadge.tsx:23:11` inside `Header` -> `ShopLayout`.
**Specific mismatch:**
- Server rendered: `undefined` (or nothing)
- Client rendered: `<span className="absolute -top-1 -right-1 ...">`

**Cause Code:**
```typescript
{displayCount > 0 && (
  <span className="...">...</span>
)}
```
The `displayCount` is likely `0` on the server and `> 0` on the client (due to `persist` middleware in Zustand).

## 2. Root Cause Hypothesis
Zustand's `persist` middleware restores state from `localStorage` **after** the component mounts on the client.
- **Server:** `useCartStore` initializes with default state (`items: []`, so `count: 0`). Renders NO badge.
- **Client (Initial Hydration):** React expects the HTML to match the server (NO badge).
- **Client (After Mount/Persist):** Zustand rehydrates from localStorage, updates state to `count > 0`.
- **Mismatch:** If the state update happens *during* hydration or if the component reads from localStorage immediately, it causes a mismatch.

Actually, the common issue with persistent stores in Next.js is that `localStorage` is not available on the server.
The store starts empty on server. On client, it reads from localStorage.
If the component renders based on this state directly, we get a mismatch:
Server HTML: `count = 0` (No badge)
Client HTML (computed during hydration): `count = 5` (Badge exists) -> **Hydration Error**.

## 3. Reproduction Plan
1. Add item to cart.
2. Refresh page.
3. Verify error in console.

## 4. Fix Strategy
We need to ensure the component renders the *same* content on server and first client render (hydration).
**Solution:** Use a `mounted` state check. Only render the persistent part (badge) after the component has mounted on the client.

## 5. Implementation Plan
1. Modify `src/components/cart/CartBadge.tsx`.
2. Add `useMounted` hook or simple `useEffect`.
3. Wrap the badge rendering in `if (!mounted) return null`.

Let's verify the current code of `CartBadge.tsx` first.
