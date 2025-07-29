'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-sm hover:shadow',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/95 shadow-sm hover:shadow',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/90 shadow-sm hover:shadow',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90 shadow-sm hover:shadow',
        ghost: 
          'hover:bg-accent hover:text-accent-foreground active:bg-accent/90',
        link: 
          'text-primary underline-offset-4 hover:underline',
        gradient:
          'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 active:from-primary/95 active:to-primary/75 shadow-lg hover:shadow-xl transition-all duration-300',
        success:
          'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm hover:shadow',
        warning:
          'bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800 shadow-sm hover:shadow',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-lg px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-10 w-10',
      },
      animation: {
        none: '',
        scale: 'hover:scale-[1.02] active:scale-[0.98]',
        bounce: 'hover:animate-pulse',
        glow: 'hover:shadow-lg hover:shadow-primary/25',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'scale',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, animation, className }),
          loading && 'cursor-wait',
          (loading || disabled) && 'pointer-events-none opacity-50'
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Загрузка...</span>
          </div>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </Comp>
    )
  }
)
EnhancedButton.displayName = 'EnhancedButton'

// Icon Button variant
export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode
  'aria-label': string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = 'icon', ...props }, ref) => {
    return (
      <EnhancedButton
        ref={ref}
        size={size}
        className={cn('flex-shrink-0', className)}
        {...props}
      >
        {icon}
      </EnhancedButton>
    )
  }
)
IconButton.displayName = 'IconButton'

// Button Group component
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'outline'
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = 'horizontal', variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          variant === 'outline' && 'border border-input rounded-lg p-1',
          '[&>button:not(:first-child)]:border-l-0',
          '[&>button:first-child]:rounded-l-lg [&>button:first-child]:rounded-r-none',
          '[&>button:last-child]:rounded-r-lg [&>button:last-child]:rounded-l-none',
          '[&>button:not(:first-child):not(:last-child)]:rounded-none',
          orientation === 'vertical' && [
            '[&>button:not(:first-child)]:border-t-0 [&>button:not(:first-child)]:border-l',
            '[&>button:first-child]:rounded-t-lg [&>button:first-child]:rounded-b-none',
            '[&>button:last-child]:rounded-b-lg [&>button:last-child]:rounded-t-none',
          ],
          className
        )}
        {...props}
      />
    )
  }
)
ButtonGroup.displayName = 'ButtonGroup'

export { EnhancedButton, IconButton, ButtonGroup, buttonVariants } 