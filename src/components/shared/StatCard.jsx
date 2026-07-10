import { cn } from '../../utils/cn'

export function StatCard({ icon: Icon, label, value, trend, color = 'text-accent', bgColor = 'bg-accent-light', className }) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-100 p-4 shadow-sm', className)}>
      <div className="flex items-center gap-3 mb-2">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', bgColor)}>
          <Icon size={20} className={color} />
        </div>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-xl font-bold text-gray-900">{value}</span>
        {trend !== undefined && (
          <span className={cn('text-xs font-medium', trend >= 0 ? 'text-accent' : 'text-danger')}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  )
}
