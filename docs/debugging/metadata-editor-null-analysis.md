# MetadataEditor Runtime Error Analysis - Update

## Findings
1. `ProductForm.tsx`:
```typescript
const [formData, setFormData] = useState<Partial<Product>>(initialData || {
  ...,
  metadata: {}
})
```
When `initialData` is provided, `formData` inherits it directly. If `initialData.metadata` is `null` (from DB), then `formData.metadata` is `null`.

2. `MetadataEditor.tsx`:
```typescript
export function MetadataEditor({ value = {}, onChange }: Props) {
  ...
  const features = value.features // CRASH if value is null
```
Although `value = {}` is a default prop, it only applies if `value` is `undefined`. If `value` is passed as `null`, the default parameter is IGNORED.
Since `formData.metadata` can be `null`, `value` becomes `null`, and `value.features` throws.

## Solution
We should fix it in **MetadataEditor.tsx** to be robust.
Instead of relying on default props (which don't handle null), we should fallback manually inside the component.

```typescript
export function MetadataEditor({ value, onChange }: Props) {
  const safeValue = value || {}
  ...
  const features = safeValue.features
  ...
}
```

Wait, we should also look at `onChange`. If we edit, we call `onChange` with new object. That's fine.

## Plan
1. Edit `src/components/admin/MetadataEditor.tsx`.
2. Ensure `value` is treated as `{}` if it is null or undefined.
