'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { HelpCircle } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface InputWithPopoverProps extends React.InputHTMLAttributes<HTMLInputElement> {
  tooltip?: {
    title: string
    description: string
  }
  icon?: React.ReactNode
}

export const InputWithPopover = React.forwardRef<HTMLInputElement, InputWithPopoverProps>(
  ({ className, tooltip, icon, ...props }, ref) => {
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
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Показать подсказку"
                  >
                    <HelpCircle className="h-3 w-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64" side="top">
                  <div className="space-y-2">
                    <div className="font-medium text-foreground">
                      {tooltip.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tooltip.description}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>
    )
  }
)

InputWithPopover.displayName = "InputWithPopover"