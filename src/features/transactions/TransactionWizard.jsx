import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Banknote, TrendingUp, TrendingDown, ArrowLeftRight, Check, AlertTriangle } from 'lucide-react'
import { useWalletStore } from '../../stores/walletStore'
import { useTransactionStore } from '../../stores/transactionStore'
import { useEmergencyStore } from '../../stores/emergencyStore'
import { PageHeader } from '../../components/shared/PageHeader'
import { formatCurrency, toPersianNumber } from '../../utils/persian'
import NumberInput from '../../components/shared/NumberInput'
import { CATEGORIES, getCategoryLabel } from '../../utils/constants'
import { emergencyRepository } from '../../database/repositories/emergencyRepository'
import toast from 'react-hot-toast'

const STEPS = [
  { id: 'type', title: 'نوع تراکنش', subtitle: 'چه نوع تراکنشی؟' },
  { id: 'amount', title: 'مبلغ', subtitle: 'چقدر؟' },
  { id: 'wallet', title: 'کیف پول', subtitle: 'از کدام حساب؟' },
  { id: 'category', title: 'دسته‌بندی', subtitle: 'در چه زمینه‌ای؟' },
  { id: 'description', title: 'توضیح', subtitle: 'توضیح اضافه؟' },
  { id: 'confirm', title: 'تأیید', subtitle: 'آیا درست است؟' },
]

export default function TransactionWizard() {
  const navigate = useNavigate()
  const { wallets, loadWallets } = useWalletStore()
  const { addTransaction } = useTransactionStore()

  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    type: 'expense',
    amount: '',
    walletId: null,
    toWalletId: null,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [emergencyCheck, setEmergencyCheck] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => { loadWallets() }, [])
  useEffect(() => { inputRef.current?.focus() }, [step])

  useEffect(() => {
    if (data.walletId && data.amount) {
      emergencyRepository.checkTransaction(data.walletId, Number(data.amount)).then(setEmergencyCheck)
    } else {
      setEmergencyCheck(null)
    }
  }, [data.walletId, data.amount])

  const update = (key, value) => setData(prev => ({ ...prev, [key]: value }))

  const isTransfer = data.type === 'transfer'

  const typeLabels = {
    income: 'درآمد',
    expense: 'هزینه',
    transfer: 'انتقال',
  }

  const canProceed = () => {
    switch (STEPS[step].id) {
      case 'type': return !!data.type
      case 'amount': return !!data.amount && Number(data.amount) > 0
      case 'wallet': return isTransfer ? !!data.walletId : !!data.walletId
      case 'category': return isTransfer ? !!data.toWalletId : !!data.category
      default: return true
    }
  }

  const next = () => {
    if (step < STEPS.length - 1 && canProceed()) setStep(s => s + 1)
  }

  const prev = () => { if (step > 0) setStep(s => s - 1) }

  const handleSubmit = async () => {
    if (isTransfer) {
      await addTransaction({
        type: 'expense',
        amount: Number(data.amount),
        walletId: data.walletId,
        category: 'transfer',
        description: data.description || 'انتقال به کیف پول دیگر',
        date: data.date,
      })
      await addTransaction({
        type: 'income',
        amount: Number(data.amount),
        walletId: data.toWalletId,
        category: 'transfer',
        description: data.description || 'انتقال از کیف پول دیگر',
        date: data.date,
      })
      toast.success('انتقال با موفقیت انجام شد')
    } else {
      await addTransaction({
        ...data,
        amount: Number(data.amount),
      })
      toast.success('تراکنش با موفقیت ثبت شد')
    }
    navigate('/')
  }

  const progress = ((step + 1) / STEPS.length) * 100

  const selectedWallet = wallets.find(w => w.id === data.walletId)
  const selectedToWallet = wallets.find(w => w.id === data.toWalletId)
  const categories = CATEGORIES[data.type] || []

  const otherWallets = wallets.filter(w => w.id !== data.walletId)

  return (
    <div>
      <PageHeader title="تراکنش جدید" backButton={step === 0} />

      <div className="w-full h-1 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          {isTransfer && STEPS[step].id === 'wallet' ? 'کیف پول مبدأ' :
           isTransfer && STEPS[step].id === 'category' ? 'کیف پول مقصد' :
           isTransfer && STEPS[step].id === 'confirm' ? 'تأیید انتقال' :
           STEPS[step].title}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {isTransfer && STEPS[step].id === 'wallet' ? 'از کدام حساب؟' :
           isTransfer && STEPS[step].id === 'category' ? 'به کدام حساب؟' :
           isTransfer && STEPS[step].id === 'confirm' ? 'آیا اطلاعات درست است؟' :
           STEPS[step].subtitle}
        </p>
      </div>

      <div className="min-h-[300px]">
        {STEPS[step].id === 'type' && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'expense', label: 'هزینه', icon: TrendingDown, color: 'text-danger', bg: 'bg-danger-light', border: 'border-danger' },
              { value: 'income', label: 'درآمد', icon: TrendingUp, color: 'text-accent', bg: 'bg-accent-light', border: 'border-accent' },
              { value: 'transfer', label: 'انتقال', icon: ArrowLeftRight, color: 'text-info', bg: 'bg-info-light', border: 'border-info' },
            ].map(item => (
              <button
                key={item.value}
                onClick={() => { update('type', item.value); update('category', ''); setTimeout(next, 150) }}
                className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                  data.type === item.value ? `${item.border} ${item.bg}` : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <item.icon size={32} className={item.color} />
                <span className="text-sm font-semibold text-gray-900">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {STEPS[step].id === 'amount' && (
          <div className="text-center">
            <div className="relative">
              <NumberInput
                ref={inputRef}
                value={data.amount}
                onChange={e => update('amount', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && next()}
                placeholder="۰"
                className="!border-0 !bg-transparent w-full text-5xl font-bold text-center text-gray-900 outline-none"
                autoFocus
              />
              <div className="text-sm text-gray-400 mt-2">تومان</div>
            </div>
          </div>
        )}

        {STEPS[step].id === 'wallet' && (
          <div className="space-y-2">
            {wallets.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                ابتدا یک کیف پول بسازید
              </div>
            ) : wallets.map(wallet => (
              <button
                key={wallet.id}
                onClick={() => { update('walletId', wallet.id); if (!isTransfer) update('toWalletId', null); setTimeout(next, 150) }}
                className={`w-full p-4 rounded-2xl border-2 text-right transition-all flex items-center gap-3 ${
                  data.walletId === wallet.id ? 'border-accent bg-accent-light' : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Banknote size={20} style={{ color: wallet.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{wallet.name}</p>
                  <p className="text-xs text-gray-500">{wallet.type}</p>
                </div>
                {data.walletId === wallet.id && <Check size={20} className="text-accent" />}
              </button>
            ))}
            {emergencyCheck && !isTransfer && (
              <div className="p-3 rounded-xl bg-danger-light border border-danger/20 text-sm">
                <div className="flex items-center gap-2 text-danger font-semibold mb-1">
                  <AlertTriangle size={16} /> حالت اضطراری فعال
                </div>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p>بودجه روزانه: {formatCurrency(emergencyCheck.dailyLimit)}</p>
                  <p>مصرف امروز: {formatCurrency(emergencyCheck.todaySpent)}</p>
                  <p className={!emergencyCheck.withinLimit ? 'text-danger font-semibold' : ''}>
                    باقی‌مانده: {formatCurrency(emergencyCheck.remaining)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {STEPS[step].id === 'category' && (
          isTransfer ? (
            <div className="space-y-2">
              {otherWallets.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500">
                  کیف پول مقصدی موجود نیست
                </div>
              ) : otherWallets.map(wallet => (
                <button
                  key={wallet.id}
                  onClick={() => { update('toWalletId', wallet.id); setTimeout(next, 150) }}
                  className={`w-full p-4 rounded-2xl border-2 text-right transition-all flex items-center gap-3 ${
                    data.toWalletId === wallet.id ? 'border-accent bg-accent-light' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Banknote size={20} style={{ color: wallet.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{wallet.name}</p>
                    <p className="text-xs text-gray-500">{wallet.type}</p>
                  </div>
                  {data.toWalletId === wallet.id && <Check size={20} className="text-accent" />}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => { update('category', cat.value); setTimeout(next, 150) }}
                  className={`p-3 rounded-2xl border-2 text-center transition-all ${
                    data.category === cat.value ? 'border-accent bg-accent-light' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-900">{cat.label}</span>
                </button>
              ))}
            </div>
          )
        )}

        {STEPS[step].id === 'description' && (
          <div>
            <input
              ref={inputRef}
              value={data.description}
              onChange={e => update('description', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && next()}
              placeholder={isTransfer ? 'توضیح انتقال (اختیاری)' : 'توضیح (اختیاری)'}
              className="w-full h-14 px-4 bg-gray-50 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              autoFocus
            />
          </div>
        )}

        {STEPS[step].id === 'confirm' && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">نوع</span>
                <span className="font-medium">{typeLabels[data.type]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">مبلغ</span>
                <span className="font-bold text-lg">{formatCurrency(Number(data.amount))}</span>
              </div>
              {isTransfer ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">از کیف پول</span>
                    <span className="font-medium">{selectedWallet?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">به کیف پول</span>
                    <span className="font-medium">{selectedToWallet?.name || '-'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">کیف پول</span>
                    <span className="font-medium">{selectedWallet?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">دسته‌بندی</span>
                    <span className="font-medium">{getCategoryLabel(data.type, data.category) || '-'}</span>
                  </div>
                </>
              )}
              {data.description && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">توضیح</span>
                  <span className="font-medium">{data.description}</span>
                </div>
              )}
            </div>
            {emergencyCheck && !emergencyCheck.withinLimit && !isTransfer && (
              <div className="p-3 rounded-xl bg-danger-light border border-danger/20">
                <div className="flex items-center gap-2 text-danger font-semibold text-sm mb-1">
                  <AlertTriangle size={16} /> هشدار مصرف بیش از حد
                </div>
                <p className="text-xs text-gray-600">
                  این تراکنش معادل {toPersianNumber(emergencyCheck.daysConsumed)} روز سهمیه بودجه شماست
                </p>
              </div>
            )}
            <button
              onClick={handleSubmit}
              className="w-full h-12 bg-accent text-white rounded-2xl text-sm font-semibold hover:bg-accent-dark transition-colors shadow-sm"
            >
              {isTransfer ? 'ثبت انتقال' : 'ثبت تراکنش'}
            </button>
          </div>
        )}
      </div>

      {step > 0 && (
        <div className="flex justify-between mt-6">
          <button onClick={prev} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowRight size={16} /> قبلی
          </button>
          {!['type', 'wallet', 'category'].includes(STEPS[step].id) && step < STEPS.length - 1 && (
            <button
              onClick={next}
              disabled={!canProceed()}
              className="flex items-center gap-1 text-sm text-accent font-medium disabled:opacity-40 transition-colors"
            >
              بعدی <ArrowRight size={16} className="rotate-180" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
