import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ScrollText } from 'lucide-react'
import { useLoanStore } from '../../stores/loanStore'
import { Card } from '../../components/shared/Card'
import { PageHeader } from '../../components/shared/PageHeader'
import { EmptyState } from '../../components/shared/EmptyState'
import { ProgressBar } from '../../components/shared/ProgressBar'
import { Modal } from '../../components/shared/Modal'
import { formatCurrency, toPersianNumber } from '../../utils/persian'
import NumberInput from '../../components/shared/NumberInput'
import toast from 'react-hot-toast'

export default function LoansPage() {
  const navigate = useNavigate()
  const { loans, loadLoans, addPayment, deleteLoan } = useLoanStore()
  const [paymentModal, setPaymentModal] = useState(null)
  const [paymentData, setPaymentData] = useState({ amount: '', installment: '' })
  const [deleteModal, setDeleteModal] = useState(null)

  useEffect(() => { loadLoans() }, [])

  const handlePayment = async () => {
    if (!paymentData.amount || Number(paymentData.amount) <= 0) return
    await addPayment(paymentModal.id, Number(paymentData.amount), new Date().toISOString(), Number(paymentData.installment) || 0)
    setPaymentModal(null)
    setPaymentData({ amount: '', installment: '' })
    toast.success('قسط ثبت شد')
  }

  const handleDelete = async (id) => {
    await deleteLoan(id)
    setDeleteModal(null)
    toast.success('وام حذف شد')
  }

  return (
    <div>
      <PageHeader
        title="وام‌ها"
        subtitle="مدیریت وام‌ها و اقساط"
        action={
          <button onClick={() => navigate('/loans/new')} className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm">
            <Plus size={22} />
          </button>
        }
      />

      {loans.length === 0 ? (
        <EmptyState icon={ScrollText} title="هنوز وامی ثبت نشده" description="وام جدید اضافه کنید" action={
          <button onClick={() => navigate('/loans/new')} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium">ثبت وام</button>
        } />
      ) : (
        <div className="space-y-3">
          {loans.map(loan => {
            const pct = loan.amount > 0 ? Math.round((loan.paidAmount / loan.amount) * 100) : 0
            return (
              <Card key={loan.id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ScrollText size={18} className="text-info" />
                    <span className="text-sm font-semibold text-gray-900">{loan.title}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    loan.status === 'paid' ? 'bg-accent-light text-accent' :
                    loan.status === 'overdue' ? 'bg-danger-light text-danger' : 'bg-info-light text-info'
                  }`}>
                    {loan.status === 'paid' ? 'پرداخت شده' : loan.status === 'overdue' ? 'معوق' : 'فعال'}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">{toPersianNumber(pct)}%</span>
                  <span className="text-xs text-gray-500">{formatCurrency(loan.paidAmount)} از {formatCurrency(loan.amount)}</span>
                </div>
                <ProgressBar value={loan.paidAmount} max={loan.amount} color={loan.status === 'paid' ? 'bg-accent' : 'bg-info'} />
                <div className="flex gap-2 mt-3">
                  {loan.status !== 'paid' && (
                    <button onClick={() => { setPaymentModal(loan); setPaymentData({ amount: '', installment: '' }) }} className="flex-1 py-2 bg-info text-white rounded-xl text-xs font-medium hover:bg-blue-600 transition-colors">ثبت قسط</button>
                  )}
                  <button onClick={() => setDeleteModal(loan)} className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-danger hover:bg-red-50 transition-colors">حذف</button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={!!paymentModal} onClose={() => setPaymentModal(null)} title="ثبت قسط">
        <div className="space-y-4">
          <NumberInput value={paymentData.amount} onChange={e => setPaymentData(p => ({ ...p, amount: e.target.value }))} placeholder="مبلغ قسط" autoFocus />
          <NumberInput value={paymentData.installment} onChange={e => setPaymentData(p => ({ ...p, installment: e.target.value }))} placeholder="شماره قسط" />
          <button onClick={handlePayment} className="w-full h-12 bg-info text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">ثبت قسط</button>
        </div>
      </Modal>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="حذف وام">
        <p className="text-sm text-gray-600 mb-4">آیا از حذف وام «{deleteModal?.title}» اطمینان دارید؟</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">انصراف</button>
          <button onClick={() => handleDelete(deleteModal.id)} className="flex-1 py-2.5 bg-danger rounded-xl text-sm font-medium text-white hover:bg-red-600">حذف</button>
        </div>
      </Modal>
    </div>
  )
}
