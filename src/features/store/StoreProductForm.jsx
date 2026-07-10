import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { storeProductRepository } from '../../database/repositories/storeProductRepository'
import toast from 'react-hot-toast'
import NumberInput from '../../components/shared/NumberInput'

const schema = z.object({
  name: z.string().min(1, 'نام الزامی است'),
  type: z.string().min(1),
  buyPrice: z.string().optional(),
  sellPrice: z.string().min(1, 'قیمت فروش الزامی است'),
  stock: z.string().optional(),
})

export default function StoreProductForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', type: 'product', buyPrice: '', sellPrice: '', stock: '0' },
  })

  useEffect(() => {
    if (isEdit) {
      storeProductRepository.getById(Number(id)).then(p => {
        if (p) {
          setValue('name', p.name)
          setValue('type', p.type)
          setValue('buyPrice', String(p.buyPrice || ''))
          setValue('sellPrice', String(p.sellPrice || ''))
          setValue('stock', String(p.stock || 0))
        }
      })
    }
  }, [id, isEdit])

  const onSubmit = async (data) => {
    const payload = { ...data, buyPrice: Number(data.buyPrice) || 0, sellPrice: Number(data.sellPrice) || 0, stock: Number(data.stock) || 0 }
    if (isEdit) { await storeProductRepository.update(Number(id), payload); toast.success('کالا ویرایش شد') }
    else { await storeProductRepository.create(payload); toast.success('کالا ثبت شد') }
    navigate('/store/products')
  }

  return (
    <div>
      <h2 className="text-sm font-bold text-gray-900 mb-4">{isEdit ? 'ویرایش کالا' : 'کالا/خدمت جدید'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">نام</label>
          <input {...register('name')} placeholder="نام کالا یا خدمت" className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" autoFocus />
        </div>
        <div className="flex gap-2">
          {[{ value: 'product', label: 'کالا' }, { value: 'service', label: 'خدمات' }].map(t => (
            <button key={t.value} type="button" onClick={() => setValue('type', t.value)}
              className={`flex-1 py-2.5 rounded-xl border text-sm transition-colors ${
                watch('type') === t.value ? 'border-accent bg-accent-light text-accent' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">قیمت خرید</label>
            <NumberInput {...register('buyPrice')} placeholder="تومان" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">قیمت فروش</label>
            <NumberInput {...register('sellPrice')} placeholder="تومان" />
            {errors.sellPrice && <p className="text-xs text-danger mt-1">{errors.sellPrice.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">موجودی اولیه</label>
          <NumberInput {...register('stock')} placeholder="تعداد" />
        </div>
        <button type="submit" className="w-full h-12 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors shadow-sm">
          {isEdit ? 'ویرایش' : 'ثبت کالا'}
        </button>
      </form>
    </div>
  )
}
