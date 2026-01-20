'use client'

import { useState } from 'react'
import { ProductMetadata } from '@/types/product'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { FeaturesEditor } from './metadata/FeaturesEditor'
import { VariantsEditor } from './metadata/VariantsEditor'
import { GenericEditor } from './metadata/GenericEditor'
import { RawJsonEditor } from './metadata/RawJsonEditor'
import { Plus } from 'lucide-react'

interface Props {
  value?: ProductMetadata
  onChange: (value: ProductMetadata) => void
}

export function MetadataEditor({ value = {}, onChange }: Props) {
  const [activeTab, setActiveTab] = useState('guided')
  const [newSectionType, setNewSectionType] = useState('features')
  const [customKeyName, setCustomKeyName] = useState('')

  const features = value.features
  const variants = value.variants
  
  const otherKeys = Object.keys(value).filter(k => k !== 'features' && k !== 'variants')

  const handleUpdate = (updates: Partial<ProductMetadata>) => {
    onChange({ ...value, ...updates })
  }

  const handleRemoveSection = (key: string) => {
    const newValue = { ...value }
    delete newValue[key]
    onChange(newValue)
  }

  const handleRenameSection = (oldKey: string, newKey: string) => {
    if (oldKey === newKey || !newKey) return
    const newValue = { ...value }
    const sectionValue = newValue[oldKey]
    delete newValue[oldKey]
    newValue[newKey] = sectionValue
    onChange(newValue)
  }

  const handleAddSection = () => {
    if (newSectionType === 'features') {
      if (!features) handleUpdate({ features: {} })
    } else if (newSectionType === 'variants') {
      if (!variants) handleUpdate({ variants: [] })
    } else if (newSectionType === 'custom') {
      if (customKeyName && !(customKeyName in value)) {
        handleUpdate({ [customKeyName]: '' })
        setCustomKeyName('')
      }
    }
  }

  return (
    <div className="space-y-4">
       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
         <div className="flex items-center justify-between mb-4">
           <div className="text-sm text-neutral-500">
             Manage product attributes, variants, and custom fields.
           </div>
            <TabsList>
              <TabsTrigger value="guided" type="button">Guided</TabsTrigger>
              <TabsTrigger value="raw" type="button">Raw JSON</TabsTrigger>
            </TabsList>
         </div>

         <TabsContent value="guided" className="space-y-6">
           {features && (
             <FeaturesEditor 
               value={features} 
               onChange={(v) => handleUpdate({ features: v })} 
               onRemove={() => handleRemoveSection('features')} 
             />
           )}

           {variants && (
             <VariantsEditor 
               value={variants} 
               onChange={(v) => handleUpdate({ variants: v })} 
               onRemove={() => handleRemoveSection('variants')} 
             />
           )}

           {otherKeys.map(key => (
             <GenericEditor 
               key={key} 
               name={key} 
               value={value[key]} 
               onChange={(v) => handleUpdate({ [key]: v })} 
               onRename={(newKey) => handleRenameSection(key, newKey)}
               onRemove={() => handleRemoveSection(key)} 
             />
           ))}

           <div className="border-t pt-4">
             <div className="flex gap-2 items-center bg-neutral-50 p-3 rounded-md">
               <span className="text-sm font-medium">Add Section:</span>
               <Select 
                 value={newSectionType} 
                 onChange={e => setNewSectionType(e.target.value)}
                 className="w-40 h-9"
               >
                 <option value="features" disabled={!!features}>Features</option>
                 <option value="variants" disabled={!!variants}>Variants</option>
                 <option value="custom">Custom Field...</option>
               </Select>
               
               {newSectionType === 'custom' && (
                 <Input 
                   className="w-40 h-9"
                   placeholder="Field Name"
                   value={customKeyName}
                   onChange={e => setCustomKeyName(e.target.value)}
                 />
               )}
               
               <Button onClick={handleAddSection} size="sm" disabled={newSectionType === 'custom' && !customKeyName}>
                 <Plus className="w-4 h-4 mr-2" />
                 Add
               </Button>
             </div>
           </div>
         </TabsContent>

         <TabsContent value="raw">
           <RawJsonEditor 
             key={JSON.stringify(value)} 
             value={value} 
             onChange={v => onChange(v as ProductMetadata)} 
           />
         </TabsContent>
       </Tabs>
    </div>
  )
}
