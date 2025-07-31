import React from 'react'
import { Globe } from 'lucide-react'
import type { IconProps } from './types'

export function OtherIcon({ size = 'md', className, ...props }: IconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <Globe 
      className={`${sizeClasses[size]} text-muted-foreground ${className || ''}`}
      {...props}
    />
  )
}