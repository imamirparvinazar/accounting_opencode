import { BarChart3, ScrollText, AlertTriangle, Store, Settings, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/shared/Card'
import { cn } from '../../utils/cn'

const menuItems = [
  { to: '/reports', icon: BarChart3, label: 'گزارش‌ها', desc: 'تحلیل درآمد و هزینه', color: 'text-info', bg: 'bg-info-light' },
  { to: '/loans', icon: ScrollText, label: 'وام‌ها', desc: 'مدیریت وام‌ها و اقساط', color: 'text-purple-600', bg: 'bg-purple-50' },
  { to: '/checks', icon: ScrollText, label: 'چک‌ها', desc: 'مدیریت چک‌ها', color: 'text-warning', bg: 'bg-warning-light' },
  { to: '/emergency', icon: AlertTriangle, label: 'حالت اضطراری', desc: 'مدیریت نقدینگی', color: 'text-danger', bg: 'bg-danger-light' },
  { to: '/store', icon: Store, label: 'فروشگاه', desc: 'حساب فروشگاهی', color: 'text-accent', bg: 'bg-accent-light' },
  { to: '/settings', icon: Settings, label: 'تنظیمات', desc: 'پشتیبان‌گیری و تنظیمات', color: 'text-gray-600', bg: 'bg-gray-100' },
]

export function MoreMenu() {
  const navigate = useNavigate()

  return (
    <div>
      <h1 className="text-lg font-bold text-gray-900 mb-6">بیشتر</h1>
      <div className="grid grid-cols-2 gap-3">
        {menuItems.map(item => (
          <Card key={item.to} onClick={() => navigate(item.to)} className="h-full">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', item.bg)}>
              <item.icon size={20} className={item.color} />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{item.label}</h3>
            <p className="text-xs text-gray-500">{item.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
