# MetadataEditor Runtime Error Investigation

## 1. Error Analysis
**Error:** `Cannot read properties of null (reading 'features')`
**Location:** `src/components/admin/MetadataEditor.tsx:25:26`

**Code Frame:**
```typescript
25 |   const features = value.features
```

**Cause:** `value` is `null` (or undefined, but error says null).
This means `MetadataEditor` is being called with `value={null}` or `value={undefined}` (which might be coerced/handled poorly up the chain).

**Call Stack:**
1. `MetadataEditor` (crashes here)
2. `ProductForm` at line 101 (`<MetadataEditor ... value={...} />`)
3. `EditProductPage` at line 16 (`<ProductForm ... />`)

## 2. Hypothesis
The `ProductForm` is passing a `null` value to `MetadataEditor`'s `value` prop.
The `Product` object (fetched from DB) might have `metadata: null` in the database.
`MetadataEditor` expects `value` to be an object (even empty object `{}`), but receives `null`.

## 3. Reproduction Plan
1. Find a product in the database that has `metadata` as `null`.
2. Visit `/admin/products/[id]` for that product.
3. Observe crash.

## 4. Evidence Gathering
Let's check `src/components/admin/ProductForm.tsx` to see how it passes data.
And `src/components/admin/MetadataEditor.tsx` to see its prop types.

## 5. Fix Strategy
1. **Defensive Coding in MetadataEditor:** Handle `value` being null/undefined by defaulting to `{}`.
2. **Upstream Fix in ProductForm:** Ensure `metadata` passed to editor is never null.

Let's read the files first.
