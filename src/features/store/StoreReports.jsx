import { useEffect, useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, Percent, Package } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { storeInvoiceRepository } from '../../database/repositories/storeInvoiceRepository'
import { storeProductRepository } from '../../database/repositories/storeProductRepository'
import { Card, CardHeader, CardTitle } from '../../components/shared/Card'
import { StatCard } from '../../components/shared/StatCard'
import { formatCurrency, toPersianNumber } from '../../utils/persian'

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']

export default function StoreReports() {
  const [profitData, setProfitData] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    storeInvoiceRepository.getProfitReport().then(setProfitData)
    storeProductRepository.getAll().then(setProducts)
  }, [])

  const totals = useMemo(() => {
    const sales = profitData.reduce((s, m) => s + m.sales, 0)
    const purchases = profitData.reduce((s, m) => s + m.purchases, 0)
    const expenses = profitData.reduce((s, m) => s + m.expenses, 0)
    const tax = profitData.reduce((s, m) => s + m.tax, 0)
    const netProfit = profitData.reduce((s, m) => s + m.netProfit, 0)
    return { sales, purchases, expenses, tax, netProfit }
  }, [profitData])

  const productTypeData = useMemo(() => {
    const products_count = products.filter(p => p.type === 'product').length
    const services_count = products.filter(p => p.type === 'service').length
    return [
      { name: 'کالا', value: products_count },
      { name: 'خدمات', value: services_count },
    ]
  }, [products])

  return (
    <div>
      <h2 className="text-sm font-bold text-gray-900 mb-4">گزارش فروشگاه</h2>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard icon={TrendingUp} label="فروش کل" value={formatCurrency(totals.sales)} color="text-accent" bgColor="bg-accent-light" />
        <StatCard icon={TrendingDown} label="خرید کل" value={formatCurrency(totals.purchases)} color="text-danger" bgColor="bg-danger-light" />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <Card className="text-center py-2">
          <Percent size={14} className="text-warning mx-auto mb-1" />
          <p className="text-[10px] text-gray-500">مالیات</p>
          <p className="text-xs font-bold text-warning">{formatCurrency(totals.tax)}</p>
        </Card>
        <Card className="text-center py-2">
          <Package size={14} className="text-info mx-auto mb-1" />
          <p className="text-[10px] text-gray-500">کالاها</p>
          <p className="text-xs font-bold text-info">{toPersianNumber(products.length)}</p>
        </Card>
        <Card className={`text-center py-2 ${totals.netProfit >= 0 ? 'border-accent/30' : 'border-danger/30'}`}>
          <TrendingUp size={14} className={`mx-auto mb-1 ${totals.netProfit >= 0 ? 'text-accent' : 'text-danger'}`} />
          <p className="text-[10px] text-gray-500">سود خالص</p>
          <p className={`text-xs font-bold ${totals.netProfit >= 0 ? 'text-accent' : 'text-danger'}`}>{formatCurrency(Math.abs(totals.netProfit))}</p>
        </Card>
      </div>

      {profitData.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>روند سود ماهانه</CardTitle>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="sales" fill="#10b981" radius={[3, 3, 0, 0]} name="فروش" />
                <Bar dataKey="netProfit" fill="#3b82f6" radius={[3, 3, 0, 0]} name="سود خالص" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {productTypeData.some(d => d.value > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>ترکیب کالاها و خدمات</CardTitle>
          </CardHeader>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={productTypeData} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {productTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  )
}
