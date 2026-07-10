import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, PiggyBank, Calendar, Clock } from 'lucide-react'
import { useBudgetStore } from '../../stores/budgetStore'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { PageHeader } from '../../components/shared/PageHeader'
import { EmptyState } from '../../components/shared/EmptyState'
import { ProgressBar } from '../../components/shared/ProgressBar'
import { Modal } from '../../components/shared/Modal'
import { formatCurrency, toPersianDate, toPersianNumber } from '../../utils/persian'
import NumberInput from '../../components/shared/NumberInput'
import { BUDGET_TYPES } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function BudgetsPage() {
  const navigate = useNavigate()
  const { budgets, loadBudgets, addPayment, deleteBudget } = useBudgetStore()
  const [paymentModal, setPaymentModal] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [deleteModal, setDeleteModal] = useState(null)

  useEffect(() => { loadBudgets() }, [])

  const handlePayment = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) return
    await addPayment(paymentModal.id, Number(paymentAmount), new Date().toISOString())
    setPaymentModal(null)
    setPaymentAmount('')
    toast.success('پرداخت ثبت شد')
  }

  const handleDelete = async (id) => {
    await deleteBudget(id)
    setDeleteModal(null)
    toast.success('بودجه حذف شد')
  }

  const getRemainingDays = (endDate) => {
    const diff = new Date(endDate) - new Date()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  return (
    <div>
      <PageHeader
        title="بودجه‌ها"
        subtitle="مدیریت بودجه‌بندی"
        backButton={false}
        action={
          <button onClick={() => navigate('/budgets/new')} className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm">
            <Plus size={22} />
          </button>
        }
      />

      {budgets.length === 0 ? (
        <EmptyState icon={PiggyBank} title="هنوز بودجه‌ای ندارید" description="یک بودجه جدید تعریف کنید" action={
          <button onClick={() => navigate('/budgets/new')} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium">ساخت بودجه</button>
        } />
      ) : (
        <div className="space-y-3">
          {budgets.map(budget => {
            const pct = budget.amount > 0 ? Math.round((budget.paidAmount / budget.amount) * 100) : 0
            const remaining = budget.amount - budget.paidAmount
            const daysLeft = getRemainingDays(budget.endDate)
            const isOverdue = daysLeft === 0 && budget.status === 'active'

            return (
              <Card key={budget.id} className={`${isOverdue ? 'border-danger/30' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <PiggyBank size={18} className={isOverdue ? 'text-danger' : 'text-accent'} />
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{budget.title}</span>
                      <span className="text-xs text-gray-500 mr-2">{BUDGET_TYPES.find(b => b.value === budget.type)?.label || budget.type}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    budget.status === 'completed' ? 'bg-accent-light text-accent' :
                    isOverdue ? 'bg-danger-light text-danger' : 'bg-info-light text-info'
                  }`}>
                    {budget.status === 'completed' ? 'تکمیل' : isOverdue ? 'سررسید' : 'فعال'}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{toPersianNumber(pct)}%</span>
                  <span className="text-xs text-gray-500">{formatCurrency(budget.paidAmount)} از {formatCurrency(budget.amount)}</span>
                </div>
                <ProgressBar value={budget.paidAmount} max={budget.amount} color={isOverdue ? 'bg-danger' : budget.status === 'completed' ? 'bg-accent' : 'bg-accent'} />

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={12} /> {toPersianDate(budget.endDate)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} /> {toPersianNumber(daysLeft)} روز باقی
                  </div>
                </div>

                {budget.status !== 'completed' && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => { setPaymentModal(budget); setPaymentAmount('') }} className="flex-1 py-2 bg-accent text-white rounded-xl text-xs font-medium hover:bg-accent-dark transition-colors">
                      ثبت پرداخت
                    </button>
                    <button onClick={() => navigate(`/budgets/edit/${budget.id}`)} className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                      ویرایش
                    </button>
                    <button onClick={() => setDeleteModal(budget)} className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-danger hover:bg-red-50 transition-colors">
                      حذف
                    </button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={!!paymentModal} onClose={() => setPaymentModal(null)} title="ثبت پرداخت">
        <p className="text-sm text-gray-600 mb-4">مبلغ پرداختی برای «{paymentModal?.title}» را وارد کنید</p>
        <NumberInput
          value={paymentAmount}
          onChange={e => setPaymentAmount(e.target.value)}
          placeholder="مبلغ"
          className="mb-4"
          autoFocus
        />
        <button onClick={handlePayment} className="w-full h-12 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors">
          ثبت پرداخت
        </button>
      </Modal>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="حذف بودجه">
        <p className="text-sm text-gray-600 mb-4">آیا از حذف بودجه «{deleteModal?.title}» اطمینان دارید؟</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteModal(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">انصراف</button>
          <button onClick={() => handleDelete(deleteModal.id)} className="flex-1 px-4 py-2.5 bg-danger rounded-xl text-sm font-medium text-white hover:bg-red-600">حذف</button>
        </div>
      </Modal>
    </div>
  )
}
