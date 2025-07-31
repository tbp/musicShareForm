'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { HelpCircle } from 'lucide-react'

interface InputWithTooltipProps extends React.InputHTMLAttributes<HTMLInputElement> {
  tooltip?: {
    title: string
    description: string
  }
  icon?: React.ReactNode
}

export const InputWithTooltip = React.forwardRef<HTMLInputElement, InputWithTooltipProps>(
  ({ className, tooltip, icon, ...props }, ref) => {
    const [showTooltip, setShowTooltip] = useState(false)

    return (
      <div className="relative">
        <div className="relative">
          <input
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              (icon || tooltip) && "pr-9",
              className
            )}
            ref={ref}
            {...props}
          />
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {icon && icon}
            {tooltip && (
              <button
                type="button"
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Показать подсказку"
              >
                <HelpCircle className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && showTooltip && (
          <>
            {/* Overlay для закрытия */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowTooltip(false)}
            />
            
            {/* Tooltip content */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-background border border-border rounded-lg shadow-lg text-xs text-center z-50 w-64">
              <div className="font-medium text-foreground mb-1">
                {tooltip.title}
              </div>
              <div className="text-muted-foreground">
                {tooltip.description}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }
)

InputWithTooltip.displayName = "InputWithTooltip"