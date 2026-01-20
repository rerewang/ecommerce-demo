'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Trash2 } from 'lucide-react'

interface GenericEditorProps {
  name: string
  value: unknown
  onChange: (value: unknown) => void
  onRename: (newName: string) => void
  onRemove: () => void
}

export function GenericEditor({ name, value, onChange, onRename, onRemove }: GenericEditorProps) {
  const detectType = (val: unknown): 'string' | 'number' | 'boolean' | 'list' | 'json' => {
    if (Array.isArray(val)) return 'list'
    if (typeof val === 'boolean') return 'boolean'
    if (typeof val === 'number') return 'number'
    if (typeof val === 'object' && val !== null) return 'json'
    return 'string'
  }

  const type = detectType(value)

  const handleTypeChange = (newType: string) => {
    if (newType === type) return
    
    let newValue: unknown = ''
    if (newType === 'number') newValue = 0
    if (newType === 'boolean') newValue = true
    if (newType === 'list') newValue = []
    if (newType === 'json') newValue = {}
    if (newType === 'string') newValue = String(value || '')
    
    onChange(newValue)
  }

  const renderEditor = () => {
    switch (type) {
      case 'string':
        return <Input value={String(value || '')} onChange={e => onChange(e.target.value)} />
      case 'number':
        return <Input type="number" value={Number(value || 0)} onChange={e => onChange(Number(e.target.value))} />
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={Boolean(value)} 
              onChange={e => onChange(e.target.checked)} 
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{Boolean(value) ? 'True' : 'False'}</span>
          </div>
        )
      case 'list':
        return (
          <Input 
            placeholder="Comma separated values" 
            value={Array.isArray(value) ? value.join(', ') : ''} 
            onChange={e => onChange(e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} 
          />
        )
      case 'json':
        return (
          <Textarea 
            value={JSON.stringify(value, null, 2)} 
            onChange={e => {
              try {
                onChange(JSON.parse(e.target.value))
              } catch {
              }
            }}
            className="font-mono text-xs"
          />
        )
      default:
        return <Input value={String(value)} onChange={e => onChange(e.target.value)} />
    }
  }

  return (
    <div className="border rounded-md p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <Input 
            value={name} 
            onChange={(e) => onRename(e.target.value)} 
            className="w-40 font-medium h-8"
            placeholder="Field Name"
          />
          <Select 
            value={type} 
            onChange={e => handleTypeChange(e.target.value)}
            className="h-8 w-24 text-xs"
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="list">List</option>
            <option value="json">JSON</option>
          </Select>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-500 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      {renderEditor()}
    </div>
  )
}
