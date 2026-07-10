import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCheckStore } from '../../stores/checkStore'
import { PageHeader } from '../../components/shared/PageHeader'
import NumberInput from '../../components/shared/NumberInput'
import { PersianDatePicker } from '../../components/shared/PersianDatePicker'
import toast from 'react-hot-toast'

const schema = z.object({
  amount: z.string().min(1, 'مبلغ الزامی است'),
  issuer: z.string().min(1, 'صادرکننده الزامی است'),
  recipient: z.string().min(1, 'گیرنده الزامی است'),
  date: z.string().min(1, 'تاریخ الزامی است'),
})

export default function CheckForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { checks, addCheck, updateCheck, loadChecks } = useCheckStore()
  const isEdit = !!id

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', issuer: '', recipient: '', date: '' },
  })

  useEffect(() => {
    loadChecks()
    if (isEdit) {
      const c = checks.find(c => c.id === Number(id))
      if (c) {
        setValue('amount', String(c.amount))
        setValue('issuer', c.issuer)
        setValue('recipient', c.recipient)
        setValue('date', c.date?.split('T')[0] || '')
      }
    }
  }, [id, isEdit])

  const onSubmit = async (data) => {
    const payload = { ...data, amount: Number(data.amount), date: new Date(data.date).toISOString() }
    if (isEdit) { await updateCheck(Number(id), payload); toast.success('چک ویرایش شد') }
    else { await addCheck(payload); toast.success('چک ثبت شد') }
    navigate('/checks')
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'ویرایش چک' : 'چک جدید'} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">مبلغ</label>
          <NumberInput {...register('amount')} placeholder="مبلغ به تومان" autoFocus />
          {errors.amount && <p className="text-xs text-danger mt-1">{errors.amount.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">صادرکننده</label>
            <input {...register('issuer')} placeholder="نام صادرکننده" className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
            {errors.issuer && <p className="text-xs text-danger mt-1">{errors.issuer.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">گیرنده</label>
            <input {...register('recipient')} placeholder="نام گیرنده" className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
            {errors.recipient && <p className="text-xs text-danger mt-1">{errors.recipient.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ</label>
          <PersianDatePicker value={watch('date')} onChange={v => setValue('date', v)} />
        </div>
        <button type="submit" className="w-full h-12 bg-warning text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm">{isEdit ? 'ویرایش چک' : 'ثبت چک'}</button>
      </form>
    </div>
  )
}
