import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Package, Pencil, Trash2 } from 'lucide-react'
import { storeProductRepository } from '../../database/repositories/storeProductRepository'
import { Card } from '../../components/shared/Card'
import { EmptyState } from '../../components/shared/EmptyState'
import { Modal } from '../../components/shared/Modal'
import { formatCurrency, toPersianNumber } from '../../utils/persian'
import toast from 'react-hot-toast'

export default function StoreProducts() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [deleteModal, setDeleteModal] = useState(null)

  useEffect(() => { storeProductRepository.getAll().then(setProducts) }, [])

  const handleDelete = async (id) => {
    await storeProductRepository.delete(id)
    setProducts(p => p.filter(x => x.id !== id))
    setDeleteModal(null)
    toast.success('کالا حذف شد')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-900">مدیریت کالاها و خدمات</h2>
        <button onClick={() => navigate('/store/products/new')} className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm">
          <Plus size={18} />
        </button>
      </div>

      {products.length === 0 ? (
        <EmptyState icon={Package} title="کالایی ثبت نشده" description="کالا یا خدمت جدید اضافه کنید" action={
          <button onClick={() => navigate('/store/products/new')} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium">ثبت کالا</button>
        } />
      ) : (
        <div className="space-y-2">
          {products.map(p => (
            <Card key={p.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.type === 'product' ? 'کالا' : 'خدمات'}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-accent">{formatCurrency(p.sellPrice || 0)}</p>
                  <p className={`text-xs ${p.stock > 3 ? 'text-gray-500' : 'text-danger'}`}>
                    موجودی: {toPersianNumber(p.stock || 0)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-2 pt-2 border-t border-gray-50">
                <button onClick={() => navigate(`/store/products/edit/${p.id}`)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-info transition-colors">
                  <Pencil size={12} /> ویرایش
                </button>
                <button onClick={() => setDeleteModal(p)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-danger transition-colors">
                  <Trash2 size={12} /> حذف
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="حذف کالا">
        <p className="text-sm text-gray-600 mb-4">آیا از حذف «{deleteModal?.name}» اطمینان دارید؟</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700">انصراف</button>
          <button onClick={() => handleDelete(deleteModal.id)} className="flex-1 py-2.5 bg-danger rounded-xl text-sm font-medium text-white">حذف</button>
        </div>
      </Modal>
    </div>
  )
}
