import { useEffect, useState, useMemo } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import dayjs from 'dayjs'
import { transactionRepository } from '../../database/repositories/transactionRepository'
import { walletRepository } from '../../database/repositories/walletRepository'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { PageHeader } from '../../components/shared/PageHeader'
import { StatCard } from '../../components/shared/StatCard'
import { formatCurrency } from '../../utils/persian'
import { getCategoryLabel } from '../../utils/constants'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'

export default function ReportsPage() {
  const [transactions, setTransactions] = useState([])
  const [wallets, setWallets] = useState([])
  const [view, setView] = useState('monthly')

  useEffect(() => {
    transactionRepository.getAll().then(setTransactions)
    walletRepository.getAll().then(setWallets)
  }, [])

  const stats = useMemo(() => {
    const now = dayjs()
    const monthStart = now.startOf('month').valueOf()
    const monthEnd = now.endOf('month').valueOf()

    const monthTx = transactions.filter(t => {
      const d = new Date(t.date).getTime()
      return d >= monthStart && d <= monthEnd
    })

    const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    return { income, expense, profit: income - expense, count: monthTx.length }
  }, [transactions])

  const categoryData = useMemo(() => {
    const map = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const label = getCategoryLabel(t.type, t.category)
      map[label] = (map[label] || 0) + t.amount
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [transactions])

  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      name: i + 1,
      income: 0,
      expense: 0,
    }))
    transactions.forEach(t => {
      const d = new Date(t.date)
      const m = d.getMonth()
      if (d.getFullYear() === new Date().getFullYear()) {
        if (t.type === 'income') months[m].income += t.amount
        else if (t.type === 'expense') months[m].expense += t.amount
      }
    })
    return months
  }, [transactions])

  const walletData = useMemo(() => {
    const map = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const w = wallets.find(w => w.id === t.walletId)
      const name = w?.name || 'نامشخص'
      map[name] = (map[name] || 0) + t.amount
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [transactions, wallets])

  const COLORS_CHART = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6']

  return (
    <div>
      <PageHeader title="گزارش‌ها" subtitle="تحلیل مالی" />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={TrendingUp} label="درآمد ماه" value={formatCurrency(stats.income)} color="text-accent" bgColor="bg-accent-light" />
        <StatCard icon={TrendingDown} label="هزینه ماه" value={formatCurrency(stats.expense)} color="text-danger" bgColor="bg-danger-light" />
      </div>

      <div className="flex gap-2 mb-4">
        {['monthly', 'category', 'wallet'].map(tab => (
          <button key={tab} onClick={() => setView(tab)} className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-colors ${view === tab ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'}`}>
            {tab === 'monthly' ? 'ماهانه' : tab === 'category' ? 'دسته‌بندی' : 'کیف پول'}
          </button>
        ))}
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>نمودار ماهانه</CardTitle>
        </CardHeader>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {view === 'monthly' ? (
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="درآمد" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="هزینه" />
              </BarChart>
            ) : view === 'category' ? (
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS_CHART[i % COLORS_CHART.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <PieChart>
                <Pie data={walletData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {walletData.map((_, i) => <Cell key={i} fill={COLORS_CHART[i % COLORS_CHART.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>روند درآمد و هزینه</CardTitle>
        </CardHeader>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="income" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="درآمد" />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} name="هزینه" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
