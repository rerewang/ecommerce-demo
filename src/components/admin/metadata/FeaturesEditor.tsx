'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Trash2 } from 'lucide-react'

interface FeaturesEditorProps {
  value: Record<string, string>
  onChange: (value: Record<string, string>) => void
  onRemove: () => void
}

export function FeaturesEditor({ value, onChange, onRemove }: FeaturesEditorProps) {
  const features = value || {}

  const updateFeature = (key: string, newVal: string, oldKey?: string) => {
    const newFeatures = { ...features }
    if (oldKey !== undefined && oldKey !== key) {
      delete newFeatures[oldKey]
    }
    if (key) newFeatures[key] = newVal
    onChange(newFeatures)
  }

  const removeFeature = (key: string) => {
    const newFeatures = { ...features }
    delete newFeatures[key]
    onChange(newFeatures)
  }

  const addFeature = () => {
    if (Object.keys(features).includes('')) {
      return
    }
    onChange({ ...features, '': '' })
  }

  return (
    <div className="border rounded-md p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Features</h3>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700 hover:bg-red-50">
          Remove Section
        </Button>
      </div>
      <div className="space-y-3">
        {Object.entries(features).map(([key, val], index) => (
          <div key={index} className="flex gap-2">
            <Input 
              placeholder="Name (e.g. Material)" 
              value={key} 
              onChange={(e) => updateFeature(e.target.value, val, key)}
            />
            <Input 
              placeholder="Value (e.g. Cotton)" 
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
          Add Feature
        </Button>
      </div>
    </div>
  )
}
