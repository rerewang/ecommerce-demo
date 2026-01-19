import { ProductVariant } from '@/types/product'

interface Props {
  variants: ProductVariant[]
  selections: Record<string, string>
  onSelect: (name: string, value: string) => void
}

export function VariantSelector({ variants, selections, onSelect }: Props) {
  if (!variants?.length) return null
  
  return (
    <div className="space-y-4 mb-6">
      {variants.map((v) => (
        <div key={v.name}>
          <label className="block text-sm font-medium text-slate-700 mb-2">{v.name}</label>
          <div className="flex flex-wrap gap-2">
            {v.values.map((val) => (
              <button
                key={val}
                onClick={() => onSelect(v.name, val)}
                className={`px-3 py-1 border rounded-md text-sm ${
                  selections[v.name] === val 
                    ? 'border-primary-600 bg-primary-50 text-primary-700' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
