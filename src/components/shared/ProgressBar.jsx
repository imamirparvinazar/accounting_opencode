import { cn } from '../../utils/cn'

export function ProgressBar({ value, max = 100, color = 'bg-accent', size = 'md', className }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn(
      'w-full bg-gray-100 rounded-full overflow-hidden',
      size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2',
      className
    )}>
      <div
        className={cn('h-full rounded-full transition-all duration-500 ease-out', color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
