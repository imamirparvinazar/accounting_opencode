import { useEffect, useState } from 'react'
import { AlertTriangle, Calendar, Wallet, Ban } from 'lucide-react'
import { useEmergencyStore } from '../../stores/emergencyStore'
import { useWalletStore } from '../../stores/walletStore'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { PageHeader } from '../../components/shared/PageHeader'
import { ProgressBar } from '../../components/shared/ProgressBar'
import { Modal } from '../../components/shared/Modal'
import { formatCurrency, toPersianNumber } from '../../utils/persian'
import NumberInput from '../../components/shared/NumberInput'
import { PersianDatePicker } from '../../components/shared/PersianDatePicker'
import toast from 'react-hot-toast'

export default function EmergencyPage() {
  const { emergency, loadEmergency, saveEmergency, deleteEmergency, calculate } = useEmergencyStore()
  const { wallets, loadWallets } = useWalletStore()
  const [showSetup, setShowSetup] = useState(false)
  const [form, setForm] = useState({ walletId: '', balance: '', endDate: '' })

  useEffect(() => {
    loadEmergency()
    loadWallets()
  }, [])

  const wallet = wallets.find(w => w.id === emergency?.walletId)

  const handleSetup = async () => {
    if (!form.walletId || !form.balance || !form.endDate) return
    await saveEmergency({
      walletId: Number(form.walletId),
      balance: Number(form.balance),
      endDate: new Date(form.endDate).toISOString(),
      dailyLimit: 0,
    })
    const result = await calculate(Number(form.balance), form.endDate)
    await saveEmergency({
      walletId: Number(form.walletId),
      balance: Number(form.balance),
      endDate: new Date(form.endDate).toISOString(),
      dailyLimit: result.dailyLimit,
    })
    setShowSetup(false)
    toast.success('حالت اضطراری فعال شد')
  }

  const handleDelete = async () => {
    await deleteEmergency()
    toast.success('حالت اضطراری غیرفعال شد')
  }

  const daysLeft = emergency ? Math.max(0, Math.ceil((new Date(emergency.endDate) - new Date()) / (1000 * 60 * 60 * 24))) : 0
  const spentDays = emergency ? Math.max(0, Math.ceil((new Date() - new Date(new Date(emergency.endDate).getTime() - daysLeft * 86400000)) / (1000 * 60 * 60 * 24))) : 0
  const totalDays = emergency ? spentDays + daysLeft : 0

  return (
    <div style={{ paddingBottom: '80px' }}>
      <PageHeader title="حالت اضطراری" subtitle="مدیریت نقدینگی" />

      {!emergency ? (
        <Card>
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-danger-light flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-danger" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">حالت اضطراری فعال نیست</h3>
            <p className="text-sm text-gray-500 mb-4">با فعال کردن این حالت، بودجه روزانه شما محاسبه می‌شود</p>
            <button onClick={() => setShowSetup(true)} className="px-6 py-2.5 bg-danger text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors">
              فعال کردن حالت اضطراری
            </button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="border-danger/30 bg-danger-light/30">
            <div className="text-center py-4">
              <AlertTriangle size={32} className="text-danger mx-auto mb-2" />
              <p className="text-sm font-bold text-danger">حالت اضطراری فعال است</p>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>خلاصه وضعیت</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Wallet size={16} />
                  کیف پول
                </div>
                <span className="text-sm font-medium">{wallet?.name || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  روزهای باقی‌مانده
                </div>
                <span className="text-sm font-bold text-danger">{toPersianNumber(daysLeft)} روز</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Ban size={16} />
                  بودجه روزانه
                </div>
                <span className="text-sm font-bold text-accent">{formatCurrency(emergency.dailyLimit)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Wallet size={16} />
                  موجودی کل
                </div>
                <span className="text-sm font-bold">{formatCurrency(emergency.balance)}</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>پیشرفت</CardTitle>
            </CardHeader>
            <div className="mb-2 flex justify-between text-xs text-gray-500">
              <span>{formatCurrency(emergency.dailyLimit * spentDays)} مصرف شده</span>
              <span>{formatCurrency(emergency.dailyLimit * daysLeft)} باقی‌مانده</span>
            </div>
            <ProgressBar value={spentDays} max={totalDays} color="bg-danger" size="lg" />
            <div className="flex justify-between mt-1 text-xs text-gray-400">
              <span>{spentDays} روز</span>
              <span>{totalDays} روز</span>
            </div>
          </Card>

          <button onClick={handleDelete} className="w-full py-3 border-2 border-danger text-danger rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
            غیرفعال کردن حالت اضطراری
          </button>
        </div>
      )}

      <Modal open={showSetup} onClose={() => setShowSetup(false)} title="تنظیم حالت اضطراری">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">کیف پول</label>
            <select
              value={form.walletId}
              onChange={e => setForm(f => ({ ...f, walletId: e.target.value }))}
              className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">انتخاب کنید</option>
              {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">موجودی</label>
            <NumberInput value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} placeholder="موجودی به تومان" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ پایان</label>
            <PersianDatePicker value={form.endDate} onChange={v => setForm(f => ({ ...f, endDate: v }))} />
          </div>
          <button onClick={handleSetup} className="w-full h-12 bg-danger text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">
            فعال کردن
          </button>
        </div>
      </Modal>
    </div>
  )
}
