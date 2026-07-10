import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText } from 'lucide-react'
import { useCheckStore } from '../../stores/checkStore'
import { Card } from '../../components/shared/Card'
import { PageHeader } from '../../components/shared/PageHeader'
import { EmptyState } from '../../components/shared/EmptyState'
import { Modal } from '../../components/shared/Modal'
import { formatCurrency, toPersianDate } from '../../utils/persian'
import { CHECK_STATUSES } from '../../utils/constants'
import toast from 'react-hot-toast'

export default function ChecksPage() {
  const navigate = useNavigate()
  const { checks, loadChecks, updateCheck, deleteCheck } = useCheckStore()
  const [deleteModal, setDeleteModal] = useState(null)

  useEffect(() => { loadChecks() }, [])

  const handleStatusChange = async (check, status) => {
    await updateCheck(check.id, { ...check, status })
    toast.success('وضعیت چک تغییر کرد')
  }

  const handleDelete = async (id) => {
    await deleteCheck(id)
    setDeleteModal(null)
    toast.success('چک حذف شد')
  }

  const getStatusInfo = (status) => {
    return CHECK_STATUSES.find(s => s.value === status) || CHECK_STATUSES[0]
  }

  return (
    <div>
      <PageHeader
        title="چک‌ها"
        subtitle="مدیریت چک‌ها"
        action={
          <button onClick={() => navigate('/checks/new')} className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm">
            <Plus size={22} />
          </button>
        }
      />

      {checks.length === 0 ? (
        <EmptyState icon={FileText} title="هنوز چکی ثبت نشده" description="چک جدید اضافه کنید" action={
          <button onClick={() => navigate('/checks/new')} className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium">ثبت چک</button>
        } />
      ) : (
        <div className="space-y-3">
          {checks.map(check => {
            const statusInfo = getStatusInfo(check.status)
            return (
              <Card key={check.id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-warning" />
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(check.amount)}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: statusInfo.color + '20', color: statusInfo.color }}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                  <div><span className="text-gray-400">صادرکننده:</span> {check.issuer}</div>
                  <div><span className="text-gray-400">گیرنده:</span> {check.recipient}</div>
                  <div><span className="text-gray-400">تاریخ:</span> {toPersianDate(check.date)}</div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-50">
                  {check.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatusChange(check, 'cleared')} className="flex-1 py-2 bg-accent text-white rounded-xl text-xs font-medium hover:bg-accent-dark transition-colors">وصول شد</button>
                      <button onClick={() => handleStatusChange(check, 'returned')} className="flex-1 py-2 bg-danger text-white rounded-xl text-xs font-medium hover:bg-red-600 transition-colors">برگشت خورد</button>
                    </>
                  )}
                  <button onClick={() => setDeleteModal(check)} className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-danger hover:bg-red-50 transition-colors">حذف</button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="حذف چک">
        <p className="text-sm text-gray-600 mb-4">آیا از حذف این چک اطمینان دارید؟</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">انصراف</button>
          <button onClick={() => handleDelete(deleteModal.id)} className="flex-1 py-2.5 bg-danger rounded-xl text-sm font-medium text-white hover:bg-red-600">حذف</button>
        </div>
      </Modal>
    </div>
  )
}
