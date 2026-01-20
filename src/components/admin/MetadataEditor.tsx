'use client'

import { ProductMetadata } from '@/types/product'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Trash2 } from 'lucide-react'

interface Props {
  value?: ProductMetadata
  onChange: (value: ProductMetadata) => void
}

export function MetadataEditor({ value = {}, onChange }: Props) {
  const features = value.features || {}

  const updateFeature = (key: string, newVal: string, oldKey?: string) => {
    const newFeatures = { ...features }
    if (oldKey !== undefined && oldKey !== key) {
      delete newFeatures[oldKey]
    }
    if (key) newFeatures[key] = newVal
    onChange({ ...value, features: newFeatures })
  }

  const removeFeature = (key: string) => {
    const newFeatures = { ...features }
    delete newFeatures[key]
    onChange({ ...value, features: newFeatures })
  }

  const addFeature = () => {
    onChange({
      ...value,
      features: { ...features, '': '' }
    })
  }

  const variants = value.variants || []

  const addVariant = () => {
    onChange({
      ...value,
      variants: [...variants, { name: '', values: [] }]
    })
  }

  const updateVariant = (index: number, field: 'name' | 'values', newVal: string) => {
    const newVariants = [...variants]
    if (field === 'name') {
      newVariants[index].name = newVal
    } else {
      newVariants[index].values = newVal.split(',').map(s => s.trim()).filter(Boolean)
    }
    onChange({ ...value, variants: newVariants })
  }

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index)
    onChange({ ...value, variants: newVariants })
  }

  return (
    <div className="space-y-6 border p-4 rounded-lg bg-white">
      <div>
        <h3 className="text-lg font-medium mb-4">商品属性 (Features)</h3>
        <div className="space-y-3">
          {Object.entries(features).map(([key, val], index) => (
            <div key={index} className="flex gap-2">
              <Input 
                placeholder="属性名 (如: Material)" 
                value={key} 
                onChange={(e) => updateFeature(e.target.value, val, key)}
              />
              <Input 
                placeholder="属性值 (如: Cotton)" 
                value={val} 
                onChange={(e) => updateFeature(key, e.target.value)}
              />
              <Button variant="ghost" size="sm" onClick={() => removeFeature(key)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button type="button" onClick={addFeature} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            添加属性
          </Button>
        </div>
      </div>

      <div className="pt-6 border-t">
        <h3 className="text-lg font-medium mb-4">商品规格 (Variants)</h3>
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <div key={index} className="flex gap-2">
              <Input 
                placeholder="规格名 (如: Color)" 
                value={variant.name} 
                onChange={(e) => updateVariant(index, 'name', e.target.value)}
                className="w-1/3"
              />
              <Input 
                placeholder="值 (逗号分隔, 如: Red, Blue)" 
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
            添加规格
          </Button>
        </div>
      </div>
    </div>
  )
}
