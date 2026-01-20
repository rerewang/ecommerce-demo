'use client'

import { Textarea } from '@/components/ui/Textarea'
import { useState, useEffect } from 'react'

interface RawJsonEditorProps {
  value: unknown
  onChange: (value: unknown) => void
}

export function RawJsonEditor({ value, onChange }: RawJsonEditorProps) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setText(JSON.stringify(value, null, 2))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (newText: string) => {
    setText(newText)
    try {
      const parsed = JSON.parse(newText)
      setError(null)
      onChange(parsed)
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('Invalid JSON')
      }
    }
  }

  return (
    <div className="space-y-2">
      <Textarea 
        value={text} 
        onChange={(e) => handleChange(e.target.value)} 
        className="font-mono text-sm min-h-[400px]"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
