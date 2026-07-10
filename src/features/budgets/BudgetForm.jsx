import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBudgetStore } from '../../stores/budgetStore'
import { PageHeader } from '../../components/shared/PageHeader'
import { BUDGET_TYPES, COLORS } from '../../utils/constants'
import NumberInput from '../../components/shared/NumberInput'
import { PersianDatePicker } from '../../components/shared/PersianDatePicker'
import toast from 'react-hot-toast'

const schema = z.object({
  title: z.string().min(1, 'عنوان الزامی است'),
  type: z.string().min(1),
  amount: z.string().min(1, 'مبلغ الزامی است'),
  color: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
})

export default function BudgetForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { budgets, addBudget, updateBudget, loadBudgets } = useBudgetStore()
  const isEdit = !!id

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: '', type: 'personal', amount: '', color: '#10b981', startDate: '', endDate: '' },
  })

  useEffect(() => {
    loadBudgets()
    if (isEdit) {
      const b = budgets.find(b => b.id === Number(id))
      if (b) {
        setValue('title', b.title)
        setValue('type', b.type)
        setValue('amount', String(b.amount))
        setValue('color', b.color)
        setValue('startDate', b.startDate?.split('T')[0] || '')
        setValue('endDate', b.endDate?.split('T')[0] || '')
      }
    }
  }, [id, isEdit])

  const selectedType = watch('type')

  const onSubmit = async (data) => {
    const payload = { ...data, amount: Number(data.amount), startDate: new Date(data.startDate).toISOString(), endDate: new Date(data.endDate).toISOString() }
    if (isEdit) {
      await updateBudget(Number(id), payload)
      toast.success('بودجه ویرایش شد')
    } else {
      await addBudget(payload)
      toast.success('بودجه ساخته شد')
    }
    navigate('/budgets')
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'ویرایش بودجه' : 'بودجه جدید'} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">عنوان</label>
          <input {...register('title')} placeholder="مثلاً: خرید ماهانه" className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" autoFocus />
          {errors.title && <p className="text-xs text-danger mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">نوع بودجه</label>
          <div className="grid grid-cols-2 gap-2">
            {BUDGET_TYPES.map(bt => (
              <button key={bt.value} type="button" onClick={() => setValue('type', bt.value)} className={`p-3 rounded-xl border text-sm transition-all ${selectedType === bt.value ? 'border-accent bg-accent-light text-accent' : 'border-gray-200 bg-white text-gray-600'}`}>
                {bt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">مبلغ</label>
          <NumberInput {...register('amount')} placeholder="مبلغ به تومان" />
          {errors.amount && <p className="text-xs text-danger mt-1">{errors.amount.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ شروع</label>
            <PersianDatePicker value={watch('startDate')} onChange={v => setValue('startDate', v)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ پایان</label>
            <PersianDatePicker value={watch('endDate')} onChange={v => setValue('endDate', v)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">رنگ</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(color => (
              <button key={color} type="button" onClick={() => setValue('color', color)} className={`w-8 h-8 rounded-xl transition-transform ${watch('color') === color ? 'scale-125 ring-2 ring-offset-2 ring-gray-300' : ''}`} style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>

        <button type="submit" className="w-full h-12 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors shadow-sm">
          {isEdit ? 'ویرایش بودجه' : 'ساخت بودجه'}
        </button>
      </form>
    </div>
  )
}
