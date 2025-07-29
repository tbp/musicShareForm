'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AnimatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  required?: boolean
  error?: string
  hint?: string
}

const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ className, type = 'text', label, required = false, error, hint, id, placeholder, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId

    return (
      <div className="relative">
        {/* Input Field */}
        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={label ? ' ' : placeholder} // Space for floating label detection
          className={cn(
            // Base styles
            'peer w-full bg-background border border-input rounded-lg px-3 text-foreground',
            'placeholder:text-transparent placeholder-shown:border-input',
            'transition-all duration-200 ease-out',
            'focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary',
            
            // Padding based on label presence
            label ? 'pt-6 pb-2' : 'py-3',
            
            // Error states
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            
            className
          )}
          {...props}
        />

        {/* Floating Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'absolute left-3 transition-all duration-200 ease-out pointer-events-none',
              'text-muted-foreground bg-background px-1 select-none',
              // Default position (when input is empty and not focused)
              'top-1/2 -translate-y-1/2 text-base',
              // Floating position (when input has content or is focused)
              'peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-primary',
              'peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs',
              // Error state colors
              error && 'peer-focus:text-destructive text-destructive',
            )}
          >
            {label}
            {required && (
              <span className="ml-1 text-destructive">*</span>
            )}
          </label>
        )}

        {/* Helper Text / Error Message */}
        {(hint || error) && (
          <div className="mt-1.5 text-xs">
            {error ? (
              <span className="text-destructive">
                {error}
              </span>
            ) : hint ? (
              <span className="text-muted-foreground">
                {hint}
              </span>
            ) : null}
          </div>
        )}
      </div>
    )
  }
)

AnimatedInput.displayName = 'AnimatedInput'

export { AnimatedInput } 