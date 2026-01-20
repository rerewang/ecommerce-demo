'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
} | null>(null)

export function Tabs({ defaultValue, value, onValueChange, className, children }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '')
  
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue
  const handleChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value: currentValue!, onValueChange: handleChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  className?: string
  children: React.ReactNode
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-neutral-100 p-1 text-neutral-500',
        className
      )}
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  className?: string
  children: React.ReactNode
}

export function TabsTrigger({ value, className, children, type = 'button', ...props }: TabsTriggerProps) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        context.value === value
          ? 'bg-white text-neutral-950 shadow-sm'
          : 'hover:bg-neutral-200/50 hover:text-neutral-900',
        className
      )}
      {...props}
      onClick={(e) => {
        props.onClick?.(e)
        context.onValueChange(value)
      }}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  className?: string
  children: React.ReactNode
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')

  if (context.value !== value) return null

  return (
    <div
      className={cn(
        'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2',
        className
      )}
    >
      {children}
    </div>
  )
}
