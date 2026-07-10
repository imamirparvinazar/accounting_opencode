import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, FileText, CreditCard, BarChart3, ArrowRight } from 'lucide-react'
import { cn } from '../../utils/cn'

const navItems = [
  { to: '/store', icon: LayoutDashboard, label: 'داشبورد', exact: true },
  { to: '/store/products', icon: Package, label: 'کالاها' },
  { to: '/store/invoices', icon: FileText, label: 'فاکتورها' },
  { to: '/store/installments', icon: CreditCard, label: 'قسطی' },
  { to: '/store/reports', icon: BarChart3, label: 'گزارش‌ها' },
]

export function StoreLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg-page">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center h-12 gap-2">
            <button onClick={() => navigate('/')} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowRight size={20} className="text-gray-500" />
            </button>
            <span className="text-sm font-bold text-gray-900">فروشگاه</span>
          </div>
          <div className="grid grid-cols-5 gap-1 pb-2">
            {navItems.map(item => {
              const isActive = item.exact
                ? location.pathname === '/store'
                : location.pathname.startsWith(item.to)
              return (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                    isActive ? 'bg-accent text-white' : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <item.icon size={14} />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <main className="max-w-lg mx-auto px-4 pt-4 pb-24">
        <Outlet />
      </main>
    </div>
  )
}
