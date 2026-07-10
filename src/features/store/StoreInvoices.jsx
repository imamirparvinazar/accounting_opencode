import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, TrendingUp, TrendingDown, Receipt } from 'lucide-react'
import { storeInvoiceRepository } from '../../database/repositories/storeInvoiceRepository'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { EmptyState } from '../../components/shared/EmptyState'
import { formatCurrency, toPersianDate, toPersianNumber } from '../../utils/persian'
import toast from 'react-hot-toast'

const typeLabels = { sale: 'فروش', purchase: 'خرید', expense: 'هزینه' }
const typeColors = { sale: 'text-accent bg-accent-light', purchase: 'text-danger bg-danger-light', expense: 'text-warning bg-warning-light' }

export default function StoreInvoices() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => { storeInvoiceRepository.getAll().then(setInvoices) }, [])

  const handleDelete = async (inv) => {
    if (!confirm(`حذف فاکتور ${inv.number}؟`)) return
    await storeInvoiceRepository.delete(inv.id)
    setInvoices(p => p.filter(x => x.id !== inv.id))
    toast.success('فاکتور حذف شد')
  }

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.type === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900">فاکتورها</h2>
        <button onClick={() => navigate('/store/invoices/new')} className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm">
          <Plus size={18} />
        </button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {[
          { value: 'all', label: 'همه' },
          { value: 'sale', label: 'فروش' },
          { value: 'purchase', label: 'خرید' },
          { value: 'expense', label: 'هزینه' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${filter === f.value ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="فاکتوری یافت نشد" description="فاکتور جدید ثبت کنید" action={
          <button onClick={() => navigate('/store/invoices/new')} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium">ثبت فاکتور</button>
        } />
      ) : (
        <div className="space-y-2">
          {filtered.map(inv => {
            const [colorClass, bgClass] = typeColors[inv.type]?.split(' ') || []
            return (
              <Card key={inv.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[inv.type]}`}>{typeLabels[inv.type]}</span>
                    <span className="text-xs text-gray-400">{inv.number}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(inv.finalTotal || inv.total || 0)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{toPersianDate(inv.date)}</span>
                  <span>{inv.customerName || '-'}</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
