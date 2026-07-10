import { Search, X } from 'lucide-react'
import { cn } from '../../utils/cn'

export function SearchInput({ value, onChange, placeholder = 'جستجو...', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pr-10 pl-9 bg-gray-100 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <X size={16} className="text-gray-400" />
        </button>
      )}
    </div>
  )
}
