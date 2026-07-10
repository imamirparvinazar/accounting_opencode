import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Percent } from 'lucide-react'
import { storeProductRepository } from '../../database/repositories/storeProductRepository'
import { storeInvoiceRepository } from '../../database/repositories/storeInvoiceRepository'
import { Card } from '../../components/shared/Card'
import { formatCurrency, toPersianNumber } from '../../utils/persian'
import NumberInput from '../../components/shared/NumberInput'
import { PersianDatePicker } from '../../components/shared/PersianDatePicker'
import toast from 'react-hot-toast'

export default function StoreInvoiceForm() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [type, setType] = useState('sale')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [customerName, setCustomerName] = useState('')
  const [taxRate, setTaxRate] = useState(9)
  const [items, setItems] = useState([{ productId: '', name: '', quantity: 1, price: 0, buyPrice: 0 }])

  useEffect(() => { storeProductRepository.getAll().then(setProducts) }, [])

  const addItem = () => setItems(i => [...i, { productId: '', name: '', quantity: 1, price: 0, buyPrice: 0 }])

  const updateItem = (idx, field, value) => {
    setItems(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }

      if (field === 'productId') {
        const p = products.find(x => x.id === Number(value))
        if (p) {
          next[idx].name = p.name
          next[idx].price = type === 'sale' ? p.sellPrice : p.buyPrice
          next[idx].buyPrice = p.buyPrice
        }
      }
      return next
    })
  }

  const removeItem = (idx) => setItems(i => i.filter((_, k) => k !== idx))

  const subtotal = items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0)
  const tax = Math.round(subtotal * taxRate / 100)
  const finalTotal = subtotal + tax

  const handleSubmit = async () => {
    const validItems = items.filter(i => i.name && Number(i.quantity) > 0 && Number(i.price) > 0)
    if (validItems.length === 0) { toast.error('حداقل یک آیتم وارد کنید'); return }

    const invoiceItems = validItems.map(i => ({
      productId: i.productId ? Number(i.productId) : null,
      productName: i.name,
      quantity: Number(i.quantity),
      price: Number(i.price),
      buyPrice: Number(i.buyPrice) || 0,
      total: Number(i.price) * Number(i.quantity),
    }))

    await storeInvoiceRepository.create({
      type, date: new Date(date).toISOString(),
      customerName, total: subtotal, tax, finalTotal,
      items: invoiceItems,
    })

    toast.success('فاکتور ثبت شد')
    navigate('/store/invoices')
  }

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900">فاکتور جدید</h2>
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { value: 'sale', label: 'فروش', icon: '+' },
          { value: 'purchase', label: 'خرید', icon: '+' },
          { value: 'expense', label: 'هزینه', icon: '+' },
        ].map(t => (
          <button key={t.value} onClick={() => { setType(t.value); setItems([{ productId: '', name: '', quantity: 1, price: 0, buyPrice: 0 }]) }}
            className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${type === t.value ? 'border-accent bg-accent-light text-accent' : 'border-gray-200 text-gray-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 mb-4">
        <PersianDatePicker value={date} onChange={setDate} />
        {type !== 'expense' && (
          <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="نام مشتری / تأمین‌کننده" className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-gray-200 text-sm" />
        )}
      </div>

      <div className="space-y-2 mb-4">
        {items.map((item, idx) => (
          <Card key={idx}>
            <div className="flex gap-2 mb-2">
              <select value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)} className="flex-1 h-10 px-3 bg-gray-50 rounded-xl border border-gray-200 text-sm">
                <option value="">انتخاب کالا</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({toPersianNumber(p.stock)} عدد)</option>)}
              </select>
              <button onClick={() => removeItem(idx)} className="p-2 text-danger hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-gray-500">تعداد</label>
                <NumberInput value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} className="h-10 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500">قیمت واحد</label>
                <NumberInput value={item.price} onChange={e => updateItem(idx, 'price', e.target.value)} className="h-10 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500">جمع</label>
                <div className="h-10 flex items-center text-sm font-bold text-gray-900">
                  {formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 0))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <button onClick={addItem} className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-accent hover:text-accent transition-colors mb-4">
        <Plus size={16} className="inline ml-1" /> افزودن آیتم
      </button>

      {type === 'sale' && (
        <div className="flex items-center gap-2 mb-4">
          <Percent size={16} className="text-warning" />
          <NumberInput value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} className="w-20 h-10 text-sm" />
          <span className="text-sm text-gray-500">% مالیات</span>
        </div>
      )}

      <Card className="mb-4">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">جمع کل</span><span>{formatCurrency(subtotal)}</span></div>
          {type === 'sale' && <div className="flex justify-between"><span className="text-gray-500">مالیات ({toPersianNumber(taxRate)}%)</span><span className="text-warning">{formatCurrency(tax)}</span></div>}
          <div className="border-t border-gray-100 pt-1 flex justify-between font-bold"><span>قابل پرداخت</span><span className="text-accent">{formatCurrency(finalTotal)}</span></div>
        </div>
      </Card>

      <button onClick={handleSubmit} className="w-full h-12 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors shadow-sm">
        ثبت فاکتور
      </button>
    </div>
  )
}
