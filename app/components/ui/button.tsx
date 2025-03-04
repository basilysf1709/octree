'use client'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm'
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