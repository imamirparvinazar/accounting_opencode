import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const styles = {
  primary: 'bg-accent text-white hover:bg-accent-dark shadow-sm',
  secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm',
  danger: 'bg-danger text-white hover:bg-red-600 shadow-sm',
  ghost: 'text-gray-600 hover:bg-gray-100',
  outline: 'border-2 border-accent text-accent hover:bg-accent-light',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
}

const Button = forwardRef(({ className, variant = 'primary', size = 'md', icon: Icon, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50 disabled:cursor-not-allowed',
      styles[variant],
      sizes[size],
      className
    )}
    {...props}
  >
    {Icon && <Icon size={18} />}
    {children}
  </button>
))

Button.displayName = 'Button'
export default Button
