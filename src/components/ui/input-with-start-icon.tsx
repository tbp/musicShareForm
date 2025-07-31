'use client'

import { useId } from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface InputWithStartIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon
  label?: string
}

export function InputWithStartIcon({
  icon: Icon,
  label,
  className,
  ...props
}: InputWithStartIconProps) {
  const id = useId()

  return (
    <div className="grid w-full items-center gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <input
          id={id}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            Icon && "pl-9",
            className
          )}
          {...props}
        />
      </div>
    </div>
  )
}