import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowLeftRight, PiggyBank, Wallet } from 'lucide-react'
import { cn } from '../../utils/cn'

const actions = [
  { to: '/transactions/new', icon: ArrowLeftRight, label: 'تراکنش جدید', color: 'bg-accent' },
  { to: '/wallets/new', icon: Wallet, label: 'کیف پول جدید', color: 'bg-info' },
  { to: '/budgets/new', icon: PiggyBank, label: 'بودجه جدید', color: 'bg-warning' },
]

export function FabMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-20 left-4 z-50 flex flex-col items-center gap-3">
      {open && actions.map(action => (
        <button
          key={action.to}
          onClick={() => { setOpen(false); navigate(action.to) }}
          className={cn('w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center text-white', action.color)}
        >
          <action.icon size={20} />
        </button>
      ))}

      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-2xl bg-accent shadow-lg flex items-center justify-center text-white"
      >
        <Plus size={26} className={open ? 'rotate-45' : ''} />
      </button>
    </div>
  )
}
