import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Wallet, PiggyBank, BarChart3, Settings } from 'lucide-react'
import { cn } from '../../utils/cn'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'داشبورد' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'تراکنش‌ها' },
  { to: '/wallets', icon: Wallet, label: 'کیف‌پول‌ها' },
  { to: '/budgets', icon: PiggyBank, label: 'بودجه‌ها' },
  { to: '/more', icon: BarChart3, label: 'بیشتر' },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-lg border-t border-gray-100 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map(item => {
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors duration-200',
                isActive ? 'text-accent' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <item.icon size={22} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
