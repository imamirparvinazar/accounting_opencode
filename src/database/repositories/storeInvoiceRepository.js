import { db } from '../schema/db'
import { storeProductRepository } from './storeProductRepository'

function generateInvoiceNumber(type) {
  const prefix = type === 'sale' ? 'F' : type === 'purchase' ? 'P' : 'E'
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`
}

export const storeInvoiceRepository = {
  async getAll() {
    return db.storeInvoices.orderBy('createdAt').reverse().toArray()
  },

  async getById(id) {
    const invoice = await db.storeInvoices.get(id)
    if (!invoice) return null
    invoice.items = await db.storeInvoiceItems.where('invoiceId').equals(id).toArray()
    return invoice
  },

  async getByType(type) {
    return db.storeInvoices.where('type').equals(type).reverse().sortBy('createdAt')
  },

  async create(invoiceData) {
    const { items, ...data } = invoiceData
    const id = await db.storeInvoices.add({
      ...data,
      number: generateInvoiceNumber(data.type),
      createdAt: Date.now(),
    })
    if (items && items.length > 0) {
      const invoiceItems = items.map(item => ({
        ...item,
        invoiceId: id,
        createdAt: Date.now(),
      }))
      await db.storeInvoiceItems.bulkAdd(invoiceItems)

      for (const item of items) {
        if (item.productId) {
          const delta = data.type === 'purchase' ? item.quantity : (data.type === 'sale' ? -item.quantity : 0)
          if (delta !== 0) await storeProductRepository.adjustStock(item.productId, delta)
        }
      }
    }
    return id
  },

  async delete(id) {
    const invoice = await db.storeInvoices.get(id)
    if (invoice && invoice.items) {
      for (const item of invoice.items) {
        if (item.productId) {
          const delta = invoice.type === 'purchase' ? -item.quantity : (invoice.type === 'sale' ? item.quantity : 0)
          if (delta !== 0) await storeProductRepository.adjustStock(item.productId, delta)
        }
      }
    }
    await db.storeInvoiceItems.where('invoiceId').equals(id).delete()
    return db.storeInvoices.delete(id)
  },

  async getStats() {
    const invoices = await db.storeInvoices.toArray()
    const items = await db.storeInvoiceItems.toArray()
    const products = await db.storeProducts.toArray()

    let totalSales = 0, totalPurchases = 0, totalExpenses = 0, totalTax = 0
    let saleCount = 0, purchaseCount = 0

    for (const inv of invoices) {
      const invItems = items.filter(i => i.invoiceId === inv.id)
      const subtotal = invItems.reduce((s, i) => s + (i.total || 0), 0)
      const tax = inv.tax || 0

      if (inv.type === 'sale') { totalSales += subtotal; totalTax += tax; saleCount++ }
      else if (inv.type === 'purchase') { totalPurchases += subtotal; purchaseCount++ }
      else if (inv.type === 'expense') { totalExpenses += subtotal }
    }

    const costOfGoods = await this.getCOGS(items, invoices)
    const grossProfit = totalSales - costOfGoods
    const netProfit = grossProfit - totalExpenses - totalTax

    return {
      totalSales, totalPurchases, totalExpenses, totalTax,
      saleCount, purchaseCount,
      costOfGoods, grossProfit, netProfit,
      totalInvoices: invoices.length,
      totalProducts: products.length,
    }
  },

  async getCOGS(items, invoices) {
    let cogs = 0
    for (const inv of invoices) {
      if (inv.type === 'sale') {
        const invItems = items.filter(i => i.invoiceId === inv.id)
        for (const item of invItems) {
          cogs += (item.buyPrice || 0) * item.quantity
        }
      }
    }
    return cogs
  },

  async getProfitReport() {
    const invoices = await db.storeInvoices.toArray()
    const items = await db.storeInvoiceItems.toArray()
    const monthly = {}

    for (const inv of invoices) {
      const d = new Date(inv.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!monthly[key]) monthly[key] = { sales: 0, purchases: 0, expenses: 0, tax: 0, cogs: 0 }

      const invItems = items.filter(i => i.invoiceId === inv.id)
      const subtotal = invItems.reduce((s, i) => s + (i.total || 0), 0)

      if (inv.type === 'sale') {
        monthly[key].sales += subtotal
        monthly[key].tax += inv.tax || 0
        for (const item of invItems) monthly[key].cogs += (item.buyPrice || 0) * item.quantity
      } else if (inv.type === 'purchase') {
        monthly[key].purchases += subtotal
      } else if (inv.type === 'expense') {
        monthly[key].expenses += subtotal
      }
    }

    return Object.entries(monthly).map(([month, data]) => ({
      month,
      ...data,
      grossProfit: data.sales - data.cogs,
      netProfit: data.sales - data.cogs - data.expenses - data.tax,
    }))
  },
}
