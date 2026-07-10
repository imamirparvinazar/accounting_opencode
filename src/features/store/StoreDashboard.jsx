import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, Package, FileText, CreditCard, Percent, Plus } from 'lucide-react'
import { storeInvoiceRepository } from '../../database/repositories/storeInvoiceRepository'
import { storeProductRepository } from '../../database/repositories/storeProductRepository'
import { storeInstallmentRepository } from '../../database/repositories/storeInstallmentRepository'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { StatCard } from '../../components/shared/StatCard'
import { formatCurrency, toPersianNumber } from '../../utils/persian'

export default function StoreDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [installments, setInstallments] = useState([])

  useEffect(() => {
    storeInvoiceRepository.getStats().then(setStats)
    storeProductRepository.getAll().then(setProducts)
    storeInstallmentRepository.getAll().then(setInstallments)
  }, [])

  const activeInstallments = installments.filter(i => i.status === 'active')
  const lowStock = products.filter(p => p.stock <= 3)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-900">داشبورد فروشگاه</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/store/invoices/new')} className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm">
            <TrendingUp size={18} />
          </button>
          <button onClick={() => navigate('/store/products/new')} className="w-9 h-9 rounded-xl bg-info flex items-center justify-center text-white shadow-sm">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard icon={TrendingUp} label="فروش" value={formatCurrency(stats.totalSales)} color="text-accent" bgColor="bg-accent-light" />
            <StatCard icon={TrendingDown} label="خرید" value={formatCurrency(stats.totalPurchases)} color="text-danger" bgColor="bg-danger-light" />
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <Card className="text-center">
              <Percent size={16} className="text-warning mx-auto mb-1" />
              <p className="text-[10px] text-gray-500">مالیات</p>
              <p className="text-sm font-bold text-warning">{formatCurrency(stats.totalTax)}</p>
            </Card>
            <Card className="text-center">
              <Package size={16} className="text-info mx-auto mb-1" />
              <p className="text-[10px] text-gray-500">کالاها</p>
              <p className="text-sm font-bold text-info">{toPersianNumber(stats.totalProducts)}</p>
            </Card>
            <Card className="text-center">
              <FileText size={16} className="text-accent mx-auto mb-1" />
              <p className="text-[10px] text-gray-500">فاکتور</p>
              <p className="text-sm font-bold text-accent">{toPersianNumber(stats.totalInvoices)}</p>
            </Card>
          </div>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>سود و زیان</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">فروش ناخالص</span>
                <span className="font-medium">{formatCurrency(stats.totalSales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">بهای تمام شده</span>
                <span className="font-medium text-danger">−{formatCurrency(stats.costOfGoods)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">مالیات</span>
                <span className="font-medium text-warning">−{formatCurrency(stats.totalTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">هزینه‌ها</span>
                <span className="font-medium text-danger">−{formatCurrency(stats.totalExpenses)}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between">
                <span className="font-bold text-gray-900">سود خالص</span>
                <span className={`font-bold ${stats.netProfit >= 0 ? 'text-accent' : 'text-danger'}`}>
                  {formatCurrency(Math.abs(stats.netProfit))}
                  <span className="text-xs mr-1">{stats.netProfit >= 0 ? 'سود' : 'زیان'}</span>
                </span>
              </div>
            </div>
          </Card>

          {activeInstallments.length > 0 && (
            <Card className="mb-4 border-warning/30">
              <CardHeader>
                <CardTitle>قسط‌های فعال</CardTitle>
                <span className="text-xs px-2 py-0.5 rounded-full bg-warning-light text-warning font-medium">{toPersianNumber(activeInstallments.length)}</span>
              </CardHeader>
              <div className="space-y-2">
                {activeInstallments.slice(0, 3).map(inst => (
                  <div key={inst.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{inst.customerName}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(inst.totalAmount - inst.paidAmount)} باقی</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {lowStock.length > 0 && (
            <Card className="mb-4 border-danger/30">
              <CardHeader>
                <CardTitle>هشدار موجودی</CardTitle>
                <span className="text-xs px-2 py-0.5 rounded-full bg-danger-light text-danger font-medium">{toPersianNumber(lowStock.length)}</span>
              </CardHeader>
              <div className="space-y-1">
                {lowStock.map(p => (
                  <div key={p.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{p.name}</span>
                    <span className="text-danger font-medium">{toPersianNumber(p.stock)} عدد</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
