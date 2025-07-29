import * as React from 'react'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const FloatingInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return <Input className={cn('peer', className)} ref={ref} {...props} />
  },
)
FloatingInput.displayName = 'FloatingInput'

const FloatingLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  return (
    <Label
      className={cn(
        'absolute start-2 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-background px-2 text-sm text-muted-foreground duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-foreground cursor-text',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
FloatingLabel.displayName = 'FloatingLabel'

type FloatingLabelInputProps = React.InputHTMLAttributes<HTMLInputElement> & { 
  label?: string
  required?: boolean
}

const FloatingLabelInput = React.forwardRef<
  React.ElementRef<typeof FloatingInput>,
  React.PropsWithoutRef<FloatingLabelInputProps>
>(({ id, label, required = false, ...props }, ref) => {
  return (
    <div className="relative">
      <FloatingInput ref={ref} id={id} {...props} />
      <FloatingLabel htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </FloatingLabel>
    </div>
  )
})
FloatingLabelInput.displayName = 'FloatingLabelInput'

export { FloatingInput, FloatingLabel, FloatingLabelInput } 