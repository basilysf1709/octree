'use client'

import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "px-4 py-2",
        sm: "px-3 py-1 text-sm"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ 
  children, 
  variant = 'default', 
  size = 'default',
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'rounded font-medium transition-colors'
  const variantStyles = variant === 'outline' ? 'border border-gray-300 hover:bg-gray-50' : 'bg-primary text-white hover:bg-primary/90'
  const sizeStyles = size === 'sm' ? 'px-3 py-1 text-sm' : 'px-4 py-2'
  
  return (
    <button 
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
} 