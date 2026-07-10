import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLoanStore } from '../../stores/loanStore'
import { PageHeader } from '../../components/shared/PageHeader'
import NumberInput from '../../components/shared/NumberInput'
import { PersianDatePicker } from '../../components/shared/PersianDatePicker'
import toast from 'react-hot-toast'

const schema = z.object({
  title: z.string().min(1, 'عنوان الزامی است'),
  amount: z.string().min(1, 'مبلغ الزامی است'),
  interestRate: z.string().optional(),
  installments: z.string().optional(),
  startDate: z.string().min(1),
})

export default function LoanForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { loans, addLoan, updateLoan, loadLoans } = useLoanStore()
  const isEdit = !!id

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: '', amount: '', interestRate: '', installments: '', startDate: '' },
  })

  useEffect(() => {
    loadLoans()
    if (isEdit) {
      const l = loans.find(l => l.id === Number(id))
      if (l) {
        setValue('title', l.title)
        setValue('amount', String(l.amount))
        setValue('interestRate', String(l.interestRate || ''))
        setValue('installments', String(l.installments || ''))
        setValue('startDate', l.startDate?.split('T')[0] || '')
      }
    }
  }, [id, isEdit])

  const onSubmit = async (data) => {
    const payload = { ...data, amount: Number(data.amount), interestRate: Number(data.interestRate) || 0, installments: Number(data.installments) || 0, startDate: new Date(data.startDate).toISOString() }
    if (isEdit) { await updateLoan(Number(id), payload); toast.success('وام ویرایش شد') }
    else { await addLoan(payload); toast.success('وام ثبت شد') }
    navigate('/loans')
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'ویرایش وام' : 'وام جدید'} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">عنوان</label>
          <input {...register('title')} placeholder="مثلاً: وام مسکن" className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" autoFocus />
          {errors.title && <p className="text-xs text-danger mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">مبلغ کل</label>
          <NumberInput {...register('amount')} placeholder="مبلغ به تومان" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نرخ سود (%)</label>
            <NumberInput {...register('interestRate')} placeholder="مثلاً: ۱۸" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تعداد اقساط</label>
            <NumberInput {...register('installments')} placeholder="مثلاً: ۱۲" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ شروع</label>
          <PersianDatePicker value={watch('startDate')} onChange={v => setValue('startDate', v)} />
        </div>
        <button type="submit" className="w-full h-12 bg-info text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm">{isEdit ? 'ویرایش وام' : 'ثبت وام'}</button>
      </form>
    </div>
  )
}
