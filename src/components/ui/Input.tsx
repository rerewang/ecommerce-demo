import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full px-4 py-2 rounded-lg border transition-all duration-200',
          'font-body text-base text-slate-900 placeholder:text-slate-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Soft UI Evolution shadows
          'shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]',
          'focus-visible:shadow-[inset_0_1px_3px_rgba(0,0,0,0.06),0_0_0_3px_rgba(135,206,235,0.1)]',
          
          // States
          error
            ? 'border-red-300 focus-visible:ring-red-500 focus-visible:border-red-500'
            : 'border-slate-200 focus-visible:ring-primary-500 focus-visible:border-primary-500',
          
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
