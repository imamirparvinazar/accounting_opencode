import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, AlertTriangle } from 'lucide-react'
import dayjs from 'dayjs'
import { walletRepository } from '../../database/repositories/walletRepository'
import { transactionRepository } from '../../database/repositories/transactionRepository'
import { useWalletStore } from '../../stores/walletStore'
import { useTransactionStore } from '../../stores/transactionStore'
import { useBudgetStore } from '../../stores/budgetStore'
import { useEmergencyStore } from '../../stores/emergencyStore'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { StatCard } from '../../components/shared/StatCard'
import { ProgressBar } from '../../components/shared/ProgressBar'
import { FabMenu } from '../../app/layouts/FabMenu'
import { formatCurrency, toPersianDate, toPersianNumber } from '../../utils/persian'
import { getCategoryLabel } from '../../utils/constants'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { wallets, defaultWallet, loadWallets } = useWalletStore()
  const { transactions, loadTransactions } = useTransactionStore()
  const { activeBudgets, loadBudgets } = useBudgetStore()
  const { emergency, loadEmergency } = useEmergencyStore()

  const [walletBalances, setWalletBalances] = useState({})
  const [monthStats, setMonthStats] = useState({ income: 0, expense: 0 })

  const monthTransactions = useMemo(() => {
    const now = dayjs()
    const start = now.startOf('month').valueOf()
    const end = now.endOf('month').valueOf()
    return transactions
      .filter(t => {
        const d = new Date(t.date).getTime()
        return d >= start && d <= end
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
  }, [transactions])

  useEffect(() => {
    loadWallets()
    loadTransactions()
    loadBudgets()
    loadEmergency()
  }, [])

  useEffect(() => {
    const loadBalances = async () => {
      const balances = {}
      for (const w of wallets) {
        balances[w.id] = await walletRepository.getBalance(w.id)
      }
      setWalletBalances(balances)
    }
    if (wallets.length > 0) loadBalances()
  }, [wallets])

  useEffect(() => {
    const calcMonthStats = async () => {
      const now = dayjs()
      const start = now.startOf('month').toDate()
      const end = now.endOf('month').toDate()
      const income = await transactionRepository.getTotalIncomeByDateRange(start, end)
      const expense = await transactionRepository.getTotalExpenseByDateRange(start, end)
      setMonthStats({ income, expense })
    }
    calcMonthStats()
  }, [transactions])

  const defaultBalance = defaultWallet ? walletBalances[defaultWallet.id] || 0 : 0
  const profit = monthStats.income - monthStats.expense

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">خلاصه مالی</h1>
          <p className="text-sm text-gray-500 mt-0.5">{toPersianDate(new Date())}</p>
        </div>
        <button
          onClick={() => navigate('/transactions/new')}
          className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm"
        >
          <Plus size={22} />
        </button>
      </div>

      {defaultWallet && (
        <div
          onClick={() => navigate('/wallets')}
          className="bg-gradient-to-br from-accent to-accent-dark rounded-2xl p-5 text-white mb-6 cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={16} />
            <span className="text-sm opacity-90">{defaultWallet.name}</span>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(defaultBalance)}</div>
          <p className="text-xs opacity-75 mt-1">موجودی کل</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={TrendingUp}
          label="درآمد این ماه"
          value={formatCurrency(monthStats.income)}
          color="text-accent"
          bgColor="bg-accent-light"
        />
        <StatCard
          icon={TrendingDown}
          label="هزینه این ماه"
          value={formatCurrency(monthStats.expense)}
          color="text-danger"
          bgColor="bg-danger-light"
        />
      </div>

      {profit !== 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>سود / زیان</CardTitle>
          </CardHeader>
          <div className={`text-lg font-bold ${profit >= 0 ? 'text-accent' : 'text-danger'}`}>
            {formatCurrency(Math.abs(profit))}
            <span className="text-sm mr-1">{profit >= 0 ? 'سود' : 'زیان'}</span>
          </div>
        </Card>
      )}

      {emergency && (
        <Card className="mb-4 border-danger/30 bg-danger-light/30" onClick={() => navigate('/emergency')}>
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-danger-light flex items-center justify-center">
              <AlertTriangle size={20} className="text-danger" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-danger">حالت اضطراری فعال</p>
              <p className="text-xs text-gray-500">بودجه روزانه: {formatCurrency(emergency.dailyLimit)}</p>
            </div>
          </div>
        </Card>
      )}

      {activeBudgets.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">بودجه‌های فعال</h2>
            <button onClick={() => navigate('/budgets')} className="text-xs text-accent font-medium">مشاهده همه</button>
          </div>
          <div className="space-y-3">
            {activeBudgets.slice(0, 3).map(budget => (
              <Card key={budget.id} onClick={() => navigate(`/budgets/${budget.id}`)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <PiggyBank size={16} className="text-accent" />
                    <span className="text-sm font-medium text-gray-900">{budget.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {toPersianNumber(Math.round((budget.paidAmount / budget.amount) * 100))}%
                  </span>
                </div>
                <ProgressBar value={budget.paidAmount} max={budget.amount} />
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-gray-500">{formatCurrency(budget.paidAmount)}</span>
                  <span className="text-xs text-gray-500">{formatCurrency(budget.amount)}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mb-20">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">آخرین تراکنش‌ها</h2>
          <button onClick={() => navigate('/transactions')} className="text-xs text-accent font-medium">مشاهده همه</button>
        </div>
        <div className="space-y-2">
          {monthTransactions.length === 0 && (
            <Card>
              <div className="text-center py-6 text-sm text-gray-500">
                هنوز تراکنشی ثبت نشده است
              </div>
            </Card>
          )}
          {monthTransactions.map(t => (
            <Card key={t.id} onClick={() => navigate(`/transactions/${t.id}`)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    t.type === 'income' ? 'bg-accent-light' : 'bg-danger-light'
                  }`}>
                    {t.type === 'income' ? <TrendingUp size={18} className="text-accent" /> : <TrendingDown size={18} className="text-danger" />}
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
      </div>

      <FabMenu />
    </div>
  )
}
