import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { useTransactionStore } from '../../stores/transactionStore'
import { useWalletStore } from '../../stores/walletStore'
import { Card } from '../../components/shared/Card'
import { PageHeader } from '../../components/shared/PageHeader'
import { EmptyState } from '../../components/shared/EmptyState'
import { SearchInput } from '../../components/shared/SearchInput'
import { formatCurrency, toPersianDate } from '../../utils/persian'
import { getCategoryLabel } from '../../utils/constants'
import Fuse from 'fuse.js'

export default function TransactionsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const walletFilter = searchParams.get('wallet')

  const { transactions, loadTransactions } = useTransactionStore()
  const { wallets, loadWallets } = useWalletStore()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    loadTransactions()
    loadWallets()
  }, [])

  const fuse = useMemo(() => new Fuse(transactions, {
    keys: ['description', 'category', 'amount'],
    threshold: 0.4,
  }), [transactions])

  const filtered = useMemo(() => {
    let result = transactions
    if (walletFilter) result = result.filter(t => t.walletId === Number(walletFilter))
    if (filterType !== 'all') {
      if (filterType === 'transfer') result = result.filter(t => t.category === 'transfer')
      else result = result.filter(t => t.type === filterType)
    }
    if (search) result = fuse.search(search).map(r => r.item)
    return result
  }, [transactions, walletFilter, filterType, search, fuse])

  const walletName = walletFilter ? wallets.find(w => w.id === Number(walletFilter))?.name : null

  return (
    <div>
      <PageHeader
        title={walletName ? `تراکنش‌های ${walletName}` : 'تراکنش‌ها'}
        backButton={false}
        action={
          <button onClick={() => navigate('/transactions/new')} className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm">
            <Plus size={22} />
          </button>
        }
      />

      <div className="flex gap-2 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="جستجوی تراکنش..." className="flex-1" />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {[
          { value: 'all', label: 'همه' },
          { value: 'income', label: 'درآمد' },
          { value: 'expense', label: 'هزینه' },
          { value: 'transfer', label: 'انتقال' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilterType(f.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              filterType === f.value ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="تراکنشی یافت نشد"
          description={search ? 'با عبارت دیگری جستجو کنید' : 'اولین تراکنش را ثبت کنید'}
          action={
            !search && (
              <button onClick={() => navigate('/transactions/new')} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium">
                ثبت تراکنش
              </button>
            )
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <Card key={t.id} onClick={() => navigate(`/transactions/${t.id}`)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    t.type === 'income' ? 'bg-accent-light' : 'bg-danger-light'
                  }`}>
                    {t.type === 'income'
                      ? <TrendingUp size={18} className="text-accent" />
                      : <TrendingDown size={18} className="text-danger" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.description || getCategoryLabel(t.type, t.category)}</p>
                    <p className="text-xs text-gray-500">{toPersianDate(t.date)}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-accent' : 'text-danger'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
