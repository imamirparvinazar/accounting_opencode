import { useEffect, useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Package } from 'lucide-react'
import dayjs from 'dayjs'
import { transactionRepository } from '../../database/repositories/transactionRepository'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { PageHeader } from '../../components/shared/PageHeader'
import { StatCard } from '../../components/shared/StatCard'
import { formatCurrency } from '../../utils/persian'

export default function StorePage() {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    transactionRepository.getAll().then(setTransactions)
  }, [])

  const storeStats = useMemo(() => {
    const now = dayjs()
    const monthStart = now.startOf('month').valueOf()
    const storeTx = transactions.filter(t => t.category === 'shopping' || t.description?.includes('فروشگاه'))

    const monthTx = storeTx.filter(t => new Date(t.date).getTime() >= monthStart)
    const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

    return {
      income,
      expense,
      profit: income - expense,
      total: storeTx.length,
      purchases: storeTx.filter(t => t.type === 'expense').length,
      sales: storeTx.filter(t => t.type === 'income').length,
    }
  }, [transactions])

  return (
    <div>
      <PageHeader title="حساب فروشگاه" subtitle="مدیریت خرید و فروش" />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={TrendingUp} label="فروش" value={formatCurrency(storeStats.income)} color="text-accent" bgColor="bg-accent-light" />
        <StatCard icon={TrendingDown} label="خرید" value={formatCurrency(storeStats.expense)} color="text-danger" bgColor="bg-danger-light" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Package size={16} className="text-info" />
            <span className="text-xs text-gray-500">تعداد فروش</span>
          </div>
          <span className="text-lg font-bold text-info">{storeStats.sales}</span>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Package size={16} className="text-warning" />
            <span className="text-xs text-gray-500">تعداد خرید</span>
          </div>
          <span className="text-lg font-bold text-warning">{storeStats.purchases}</span>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سود / زیان فروشگاه</CardTitle>
        </CardHeader>
        <div className={`text-2xl font-bold ${storeStats.profit >= 0 ? 'text-accent' : 'text-danger'}`}>
          {formatCurrency(Math.abs(storeStats.profit))}
          <span className="text-sm mr-2">{storeStats.profit >= 0 ? 'سود' : 'زیان'}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">ماه جاری</p>
      </Card>
    </div>
  )
}
