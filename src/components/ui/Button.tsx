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
          'inline-flex items-center justify-center font-semibold transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Design System: Exaggerated Minimalism with clear CTA
          'shadow-sm hover:shadow-md active:scale-[0.98]',
          
          // Variants from Design System
          {
            // Primary: Orange (#F97316)
            'bg-cta text-white hover:bg-cta/90 shadow-md hover:shadow-lg': variant === 'primary',
            // Secondary: Transparent with Blue Border (#3B82F6)
            'bg-transparent text-primary border-2 border-primary hover:bg-primary/5': variant === 'secondary',
            'border-2 border-primary text-primary hover:bg-primary/5': variant === 'outline',
            'hover:bg-muted text-muted-foreground hover:text-foreground shadow-none': variant === 'ghost',
          },
          
          // Sizes
          {
            'text-sm px-3 py-1.5 rounded-lg': size === 'sm',
            'text-base px-6 py-3 rounded-xl': size === 'md',
            'text-lg px-8 py-4 rounded-2xl': size === 'lg',
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
