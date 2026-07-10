import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Banknote, CreditCard, Landmark, Vault, Smartphone, Check, Pencil, Trash2, ArrowLeftRight } from 'lucide-react'
import { useWalletStore } from '../../stores/walletStore'
import { Card } from '../../components/shared/Card'
import { PageHeader } from '../../components/shared/PageHeader'
import { EmptyState } from '../../components/shared/EmptyState'
import { Modal } from '../../components/shared/Modal'
import { walletRepository } from '../../database/repositories/walletRepository'
import { formatCurrency } from '../../utils/persian'
import { WALLET_TYPES } from '../../utils/constants'
import toast from 'react-hot-toast'

const iconMap = { Banknote, CreditCard, Landmark, Vault, Smartphone }

export default function WalletsPage() {
  const navigate = useNavigate()
  const { wallets, loadWallets, setDefault, deleteWallet } = useWalletStore()
  const [balances, setBalances] = useState({})
  const [deleteModal, setDeleteModal] = useState(null)

  useEffect(() => { loadWallets() }, [])

  useEffect(() => {
    const loadBalances = async () => {
      const b = {}
      for (const w of wallets) b[w.id] = await walletRepository.getBalance(w.id)
      setBalances(b)
    }
    if (wallets.length > 0) loadBalances()
  }, [wallets])

  const handleSetDefault = async (id) => {
    await setDefault(id)
    toast.success('کیف پول پیش‌فرض تغییر کرد')
  }

  const handleDelete = async (id) => {
    await deleteWallet(id)
    setDeleteModal(null)
    toast.success('کیف پول حذف شد')
  }

  const getWalletIcon = (type) => {
    const found = WALLET_TYPES.find(w => w.value === type)
    const Icon = iconMap[found?.icon] || Banknote
    return <Icon size={20} />
  }

  return (
    <div>
      <PageHeader
        title="کیف پول‌ها"
        subtitle="مدیریت حساب‌ها و کارت‌ها"
        backButton={false}
        action={
          <button
            onClick={() => navigate('/wallets/new')}
            className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm"
          >
            <Plus size={22} />
          </button>
        }
      />

      {wallets.length === 0 ? (
        <EmptyState
          icon={Banknote}
          title="هنوز کیف پولی ندارید"
          description="یک کیف پول جدید بسازید تا مدیریت مالی را شروع کنید"
          action={
            <button
              onClick={() => navigate('/wallets/new')}
              className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium"
            >
              ساخت کیف پول
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {wallets.map(wallet => (
            <Card key={wallet.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center" style={{ backgroundColor: wallet.color + '20', color: wallet.color }}>
                    {getWalletIcon(wallet.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{wallet.name}</p>
                      {wallet.isDefault && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-light text-accent font-medium">پیش‌فرض</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{WALLET_TYPES.find(w => w.value === wallet.type)?.label}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(balances[wallet.id] || 0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                {!wallet.isDefault && (
                  <button onClick={() => handleSetDefault(wallet.id)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-accent transition-colors">
                    <Check size={14} /> پیش‌فرض
                  </button>
                )}
                <button onClick={() => navigate(`/wallets/edit/${wallet.id}`)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-info transition-colors">
                  <Pencil size={14} /> ویرایش
                </button>
                <button onClick={() => setDeleteModal(wallet)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-danger transition-colors">
                  <Trash2 size={14} /> حذف
                </button>
                <button onClick={() => navigate(`/transactions?wallet=${wallet.id}`)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-accent transition-colors">
                  <ArrowLeftRight size={14} /> تراکنش‌ها
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="حذف کیف پول">
        <p className="text-sm text-gray-600 mb-4">
          آیا از حذف کیف پول «{deleteModal?.name}» اطمینان دارید؟ تمام تراکنش‌های آن نیز حذف خواهند شد.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteModal(null)}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            انصراف
          </button>
          <button
            onClick={() => handleDelete(deleteModal.id)}
            className="flex-1 px-4 py-2.5 bg-danger rounded-xl text-sm font-medium text-white hover:bg-red-600 transition-colors"
          >
            حذف
          </button>
        </div>
      </Modal>
    </div>
  )
}
