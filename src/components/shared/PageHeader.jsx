import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../utils/cn'

export function PageHeader({ title, subtitle, action, backButton = true, className }) {
  const navigate = useNavigate()

  return (
    <div className={cn('flex items-center justify-between mb-6', className)}>
      <div className="flex items-center gap-3">
        {backButton && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowRight size={22} className="text-gray-600" />
          </button>
        )}
        <div>
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
