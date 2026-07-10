import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useWalletStore } from '../../stores/walletStore'
import { PageHeader } from '../../components/shared/PageHeader'
import { WALLET_TYPES, COLORS } from '../../utils/constants'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z.string().min(1, 'نام الزامی است'),
  type: z.string().min(1, 'نوع الزامی است'),
  color: z.string().min(1),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
})

export default function WalletForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { wallets, addWallet, updateWallet, loadWallets } = useWalletStore()
  const isEdit = !!id

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', type: 'cash', color: '#10b981', description: '', isDefault: false },
  })

  useEffect(() => {
    loadWallets()
    if (isEdit) {
      const wallet = wallets.find(w => w.id === Number(id))
      if (wallet) {
        setValue('name', wallet.name)
        setValue('type', wallet.type)
        setValue('color', wallet.color)
        setValue('description', wallet.description || '')
        setValue('isDefault', !!wallet.isDefault)
      }
    }
  }, [id, isEdit])

  const selectedType = watch('type')
  const selectedColor = watch('color')

  const onSubmit = async (data) => {
    if (isEdit) {
      await updateWallet(Number(id), data)
      toast.success('کیف پول ویرایش شد')
    } else {
      await addWallet(data)
      toast.success('کیف پول ساخته شد')
    }
    navigate('/wallets')
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'ویرایش کیف پول' : 'کیف پول جدید'} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">نام کیف پول</label>
          <input
            {...register('name')}
            placeholder="مثلاً: کیف پول روزانه"
            className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            autoFocus
          />
          {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">نوع کیف پول</label>
          <div className="grid grid-cols-3 gap-2">
            {WALLET_TYPES.map(wt => (
              <button
                key={wt.value}
                type="button"
                onClick={() => setValue('type', wt.value)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedType === wt.value
                    ? 'border-accent bg-accent-light text-accent'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-xs font-medium">{wt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">رنگ</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className={`w-8 h-8 rounded-xl transition-transform ${selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-300' : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">توضیح (اختیاری)</label>
          <input
            {...register('description')}
            placeholder="توضیح کوتاه..."
            className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            {...register('isDefault')}
            id="isDefault"
            className="w-5 h-5 rounded-lg border-gray-300 text-accent focus:ring-accent/30"
          />
          <label htmlFor="isDefault" className="text-sm text-gray-700">کیف پول پیش‌فرض</label>
        </div>

        <button
          type="submit"
          className="w-full h-12 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors shadow-sm"
        >
          {isEdit ? 'ویرایش کیف پول' : 'ساخت کیف پول'}
        </button>
      </form>
    </div>
  )
}
