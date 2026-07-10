import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TrendingUp, TrendingDown, Wallet, Tag, CalendarDays, FileText, Trash2, Pencil } from 'lucide-react'
import { transactionRepository } from '../../database/repositories/transactionRepository'
import { walletRepository } from '../../database/repositories/walletRepository'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { PageHeader } from '../../components/shared/PageHeader'
import { Modal } from '../../components/shared/Modal'
import { formatCurrency, toPersianDate, toPersianNumber } from '../../utils/persian'
import { CATEGORIES } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function TransactionDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [tx, setTx] = useState(null)
  const [walletName, setWalletName] = useState('')
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    const load = async () => {
      const t = await transactionRepository.getById(Number(id))
      if (!t) { toast.error('تراکنش یافت نشد'); navigate('/transactions'); return }
      setTx(t)
      const w = await walletRepository.getById(t.walletId)
      setWalletName(w?.name || 'نامشخص')
    }
    load()
  }, [id])

  const handleDelete = async () => {
    await transactionRepository.delete(Number(id))
    toast.success('تراکنش حذف شد')
    navigate('/transactions')
  }

  const getCategoryLabel = (type, value) => {
    const cats = CATEGORIES[type] || []
    const found = cats.find(c => c.value === value)
    return found?.label || value
  }

  if (!tx) return null

  return (
    <div>
      <PageHeader title="جزئیات تراکنش" />

      <div className={`rounded-2xl p-6 mb-4 text-white ${tx.type === 'income' ? 'bg-accent' : 'bg-danger'}`}>
        <div className="flex items-center gap-2 mb-2">
          {tx.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          <span className="text-sm opacity-90">{tx.type === 'income' ? 'درآمد' : 'هزینه'}</span>
        </div>
        <div className="text-3xl font-bold mb-1">
          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
        </div>
        <p className="text-sm opacity-75">{toPersianDate(tx.date)}</p>
      </div>

      <div className="space-y-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Wallet size={18} className="text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">کیف پول</p>
              <p className="text-sm font-semibold text-gray-900">{walletName}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Tag size={18} className="text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">دسته‌بندی</p>
              <p className="text-sm font-semibold text-gray-900">{getCategoryLabel(tx.type, tx.category)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <CalendarDays size={18} className="text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">تاریخ</p>
              <p className="text-sm font-semibold text-gray-900">{toPersianDate(tx.date)}</p>
            </div>
          </div>
        </Card>

        {tx.description && (
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <FileText size={18} className="text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">توضیح</p>
                <p className="text-sm font-semibold text-gray-900">{tx.description}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <button
        onClick={() => setShowDelete(true)}
        className="w-full mt-6 py-3 border-2 border-danger text-danger rounded-xl text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
      >
        <Trash2 size={16} /> حذف تراکنش
      </button>

      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="حذف تراکنش">
        <p className="text-sm text-gray-600 mb-4">آیا از حذف این تراکنش اطمینان دارید؟</p>
        <div className="flex gap-3">
          <button onClick={() => setShowDelete(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">انصراف</button>
          <button onClick={handleDelete} className="flex-1 py-2.5 bg-danger rounded-xl text-sm font-medium text-white hover:bg-red-600">حذف</button>
        </div>
      </Modal>
    </div>
  )
}
