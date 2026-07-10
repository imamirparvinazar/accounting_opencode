import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CreditCard, CheckCircle, Clock } from 'lucide-react'
import { storeInstallmentRepository } from '../../database/repositories/storeInstallmentRepository'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { EmptyState } from '../../components/shared/EmptyState'
import { ProgressBar } from '../../components/shared/ProgressBar'
import { Modal } from '../../components/shared/Modal'
import { formatCurrency, toPersianNumber, toPersianDate } from '../../utils/persian'
import NumberInput from '../../components/shared/NumberInput'
import { PersianDatePicker } from '../../components/shared/PersianDatePicker'
import toast from 'react-hot-toast'

export default function StoreInstallments() {
  const navigate = useNavigate()
  const [installments, setInstallments] = useState([])
  const [paymentModal, setPaymentModal] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ customerName: '', totalAmount: '', installments: '', startDate: '' })

  useEffect(() => { storeInstallmentRepository.getAll().then(setInstallments) }, [])

  const handleCreate = async () => {
    if (!form.customerName || !form.totalAmount) return
    await storeInstallmentRepository.create({
      customerName: form.customerName,
      totalAmount: Number(form.totalAmount),
      installments: Number(form.installments) || 0,
      startDate: new Date(form.startDate).toISOString(),
    })
    setShowForm(false)
    setForm({ customerName: '', totalAmount: '', installments: '', startDate: '' })
    storeInstallmentRepository.getAll().then(setInstallments)
    toast.success('فروش قسطی ثبت شد')
  }

  const handlePayment = async () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) return
    await storeInstallmentRepository.addPayment(paymentModal.id, Number(paymentAmount))
    setPaymentModal(null)
    setPaymentAmount('')
    storeInstallmentRepository.getAll().then(setInstallments)
    toast.success('قسط دریافت شد')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900">فروش قسطی</h2>
        <button onClick={() => setShowForm(true)} className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm">
          <Plus size={18} />
        </button>
      </div>

      {installments.length === 0 ? (
        <EmptyState icon={CreditCard} title="فروش قسطی ثبت نشده" description="مشتری می‌تواند به صورت قسطی خرید کند" action={
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium">ثبت فروش قسطی</button>
        } />
      ) : (
        <div className="space-y-3">
          {installments.map(inst => {
            const pct = inst.totalAmount > 0 ? Math.round((inst.paidAmount / inst.totalAmount) * 100) : 0
            return (
              <Card key={inst.id} className={inst.status === 'paid' ? 'border-accent/30' : ''}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{inst.customerName}</p>
                    <p className="text-xs text-gray-500">{inst.installments > 0 ? `${toPersianNumber(inst.installments)} قسط` : '-'}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${inst.status === 'paid' ? 'bg-accent-light text-accent' : 'bg-warning-light text-warning'}`}>
                    {inst.status === 'paid' ? 'تسویه' : 'فعال'}
                  </span>
                </div>
                <ProgressBar value={inst.paidAmount} max={inst.totalAmount} color={inst.status === 'paid' ? 'bg-accent' : 'bg-warning'} />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatCurrency(inst.paidAmount)}</span>
                  <span>{formatCurrency(inst.totalAmount)}</span>
                </div>
                {inst.status !== 'paid' && (
                  <button onClick={() => { setPaymentModal(inst); setPaymentAmount('') }} className="w-full mt-2 py-2 bg-accent text-white rounded-xl text-xs font-medium hover:bg-accent-dark transition-colors">
                    دریافت قسط
                  </button>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="فروش قسطی جدید">
        <div className="space-y-4">
          <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="نام مشتری" className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-gray-200 text-sm" />
          <NumberInput value={form.totalAmount} onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))} placeholder="مبلغ کل" />
          <NumberInput value={form.installments} onChange={e => setForm(f => ({ ...f, installments: e.target.value }))} placeholder="تعداد اقساط" />
          <PersianDatePicker value={form.startDate} onChange={v => setForm(f => ({ ...f, startDate: v }))} />
          <button onClick={handleCreate} className="w-full h-12 bg-accent text-white rounded-xl text-sm font-semibold">ثبت</button>
        </div>
      </Modal>

      <Modal open={!!paymentModal} onClose={() => setPaymentModal(null)} title="دریافت قسط">
        <p className="text-sm text-gray-600 mb-4">مبلغ قسط از {paymentModal?.customerName}</p>
        <NumberInput value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="مبلغ" className="mb-4" autoFocus />
        <button onClick={handlePayment} className="w-full h-12 bg-accent text-white rounded-xl text-sm font-semibold">ثبت دریافت</button>
      </Modal>
    </div>
  )
}
