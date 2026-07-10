import { useEffect, useState, useRef } from 'react'
import { Download, Upload, RefreshCw } from 'lucide-react'
import { useSettingsStore } from '../../stores/settingsStore'
import { useWalletStore } from '../../stores/walletStore'
import { settingsRepository } from '../../database/repositories/settingsRepository'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { PageHeader } from '../../components/shared/PageHeader'
import { Modal } from '../../components/shared/Modal'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { settings, loadSettings, setSetting, exportData, importData } = useSettingsStore()
  const { wallets, loadWallets, setDefault } = useWalletStore()
  const [currency, setCurrency] = useState('تومان')
  const [defaultWalletId, setDefaultWalletId] = useState('')
  const [importModal, setImportModal] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    loadSettings()
    loadWallets()
  }, [])

  useEffect(() => {
    if (settings.currency) setCurrency(settings.currency)
  }, [settings])

  const handleCurrencyChange = async (value) => {
    setCurrency(value)
    await setSetting('currency', value)
    toast.success('واحد پول تغییر کرد')
  }

  const handleExport = async () => {
    const data = await exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('پشتیبان‌گیری انجام شد')
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await importData(data)
      toast.success('داده‌ها با موفقیت بازیابی شد')
      setImportModal(false)
    } catch {
      toast.error('فایل نامعتبر است')
    }
  }

  return (
    <div>
      <PageHeader title="تنظیمات" subtitle="مدیریت برنامه" />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>واحد پول</CardTitle>
          </CardHeader>
          <div className="flex gap-2">
            {['تومان', 'ریال', 'دلار', 'یورو'].map(c => (
              <button
                key={c}
                onClick={() => handleCurrencyChange(c)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  currency === c ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>کیف پول پیش‌فرض</CardTitle>
          </CardHeader>
          <select
            value={defaultWalletId}
            onChange={async (e) => {
              const val = e.target.value
              setDefaultWalletId(val)
              if (val) {
                await setDefault(Number(val))
                toast.success('کیف پول پیش‌فرض تغییر کرد')
              }
            }}
            className="w-full h-12 px-4 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">انتخاب کنید</option>
            {wallets.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>پشتیبان‌گیری</CardTitle>
          </CardHeader>
          <div className="flex gap-3">
            <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-dark transition-colors">
              <Download size={16} /> خروجی JSON
            </button>
            <button onClick={() => setImportModal(true)} className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-accent text-accent rounded-xl text-sm font-medium hover:bg-accent-light transition-colors">
              <Upload size={16} /> ورودی JSON
            </button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>بازنشانی اطلاعات</CardTitle>
          </CardHeader>
          <p className="text-xs text-gray-500 mb-3">تمام اطلاعات برنامه پاک خواهد شد. این عملیات غیرقابل بازگشت است.</p>
          <button
            onClick={async () => {
              if (window.confirm('آیا از پاک شدن تمام اطلاعات اطمینان دارید؟')) {
                await settingsRepository.importAll({ wallets: [], transactions: [], budgets: [], loans: [], checks: [], settings: [] })
                toast.success('تمام اطلاعات پاک شد')
                window.location.reload()
              }
            }}
            className="w-full py-3 border-2 border-danger text-danger rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <RefreshCw size={16} className="inline ml-1" /> پاک کردن تمام اطلاعات
          </button>
        </Card>
      </div>

      <Modal open={importModal} onClose={() => setImportModal(false)} title="بازیابی اطلاعات">
        <p className="text-sm text-gray-600 mb-4">فایل JSON پشتیبان را انتخاب کنید</p>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:bg-accent-dark"
        />
      </Modal>
    </div>
  )
}
