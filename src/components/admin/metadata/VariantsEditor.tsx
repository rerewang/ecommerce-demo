'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Trash2 } from 'lucide-react'
import { ProductVariant } from '@/types/product'

interface VariantsEditorProps {
  value: ProductVariant[]
  onChange: (value: ProductVariant[]) => void
  onRemove: () => void
}

export function VariantsEditor({ value, onChange, onRemove }: VariantsEditorProps) {
  const variants = value || []

  const addVariant = () => {
    onChange([...variants, { name: '', values: [] }])
  }

  const updateVariant = (index: number, field: 'name' | 'values', newVal: string) => {
    const newVariants = [...variants]
    if (field === 'name') {
      newVariants[index].name = newVal
    } else {
      newVariants[index].values = newVal.split(',').map(s => s.trim()).filter(Boolean)
    }
    onChange(newVariants)
  }

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index)
    onChange(newVariants)
  }

  return (
    <div className="border rounded-md p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Variants</h3>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700 hover:bg-red-50">
          Remove Section
        </Button>
      </div>
      <div className="space-y-3">
        {variants.map((variant, index) => (
          <div key={index} className="flex gap-2">
            <Input 
              placeholder="Variant Name (e.g. Color)" 
              value={variant.name} 
              onChange={(e) => updateVariant(index, 'name', e.target.value)}
              className="w-1/3"
            />
            <Input 
              placeholder="Values (comma separated, e.g. Red, Blue)" 
              defaultValue={variant.values.join(', ')} 
              onBlur={(e) => updateVariant(index, 'values', e.target.value)}
              className="flex-1"
            />
            <Button variant="ghost" size="sm" onClick={() => removeVariant(index)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button type="button" onClick={addVariant} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Variant
        </Button>
      </div>
    </div>
  )
}
