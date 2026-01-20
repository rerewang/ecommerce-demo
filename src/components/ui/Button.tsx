import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Soft UI Evolution shadows
          'shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]',
          'active:shadow-[0_1px_4px_rgba(0,0,0,0.06)] active:scale-[0.98]',
          
          // Variants
          {
            'bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-300': variant === 'primary',
            'bg-white/80 text-secondary hover:bg-white border border-stone-200 shadow-sm backdrop-blur-sm': variant === 'secondary',
            'border-2 border-primary text-primary hover:bg-primary/5': variant === 'outline',
            'hover:bg-stone-100 text-stone-600 hover:text-stone-900 shadow-none': variant === 'ghost',
          },
          
          // Sizes
          {
            'text-sm px-3 py-1.5 rounded-full': size === 'sm',
            'text-base px-4 py-2 rounded-full': size === 'md',
            'text-lg px-6 py-3 rounded-full': size === 'lg',
          },
          
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
