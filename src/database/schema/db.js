import Dexie from 'dexie'

class FinanceDB extends Dexie {
  constructor() {
    super('FinanceDB')

    this.version(3).stores({
      wallets: '++id, name, type, isDefault, createdAt',
      transactions: '++id, type, amount, walletId, category, date, createdAt, [type+date], [walletId+date]',
      budgets: '++id, title, type, startDate, endDate, status, createdAt',
      budgetPayments: '++id, budgetId, amount, date, createdAt',
      loans: '++id, title, amount, status, startDate, createdAt',
      loanPayments: '++id, loanId, amount, date, installmentNumber, createdAt',
      checks: '++id, amount, issuer, recipient, date, status, createdAt',
      categories: '++id, name, type, color, createdAt',
      emergency: '++id, walletId, balance, endDate, dailyLimit, createdAt',
      settings: '++id, key',
      storeProducts: '++id, name, type, createdAt',
      storeInvoices: '++id, type, number, date, createdAt',
      storeInvoiceItems: '++id, invoiceId, productId, createdAt',
      storeInstallments: '++id, invoiceId, customerName, createdAt',
    })

    this.wallets = this.table('wallets')
    this.transactions = this.table('transactions')
    this.budgets = this.table('budgets')
    this.budgetPayments = this.table('budgetPayments')
    this.loans = this.table('loans')
    this.loanPayments = this.table('loanPayments')
    this.checks = this.table('checks')
    this.categories = this.table('categories')
    this.emergency = this.table('emergency')
    this.settings = this.table('settings')
    this.storeProducts = this.table('storeProducts')
    this.storeInvoices = this.table('storeInvoices')
    this.storeInvoiceItems = this.table('storeInvoiceItems')
    this.storeInstallments = this.table('storeInstallments')
  }
}

export const db = new FinanceDB()
