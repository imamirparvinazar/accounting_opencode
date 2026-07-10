import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

export function Modal({ open, onClose, title, children, className }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative z-50 w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl',
          'max-h-[90vh] overflow-y-auto',
          className
        )}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
