import { db } from '../schema/db'

export const transactionRepository = {
  async getAll() {
    return db.transactions.orderBy('date').reverse().toArray()
  },

  async getById(id) {
    return db.transactions.get(id)
  },

  async getByWallet(walletId, limit) {
    let query = db.transactions.where('walletId').equals(walletId).reverse()
    if (limit) query = query.limit(limit)
    return query.toArray()
  },

  async getRecent(limit = 5) {
    return db.transactions.orderBy('date').reverse().limit(limit).toArray()
  },

  async create(transaction) {
    return db.transactions.add({
      ...transaction,
      createdAt: Date.now(),
    })
  },

  async update(id, data) {
    return db.transactions.update(id, data)
  },

  async delete(id) {
    return db.transactions.delete(id)
  },

  async getByDateRange(start, end) {
    return db.transactions
      .where('date')
      .between(start, end, true, true)
      .toArray()
  },

  async getTotalIncomeByDateRange(start, end) {
    const transactions = await db.transactions
      .where('date')
      .between(start, end, true, true)
      .filter(t => t.type === 'income')
      .toArray()
    return transactions.reduce((sum, t) => sum + t.amount, 0)
  },

  async getTotalExpenseByDateRange(start, end) {
    const transactions = await db.transactions
      .where('date')
      .between(start, end, true, true)
      .filter(t => t.type === 'expense')
      .toArray()
    return transactions.reduce((sum, t) => sum + t.amount, 0)
  },

  async getMonthlyTotals(year) {
    const all = await db.transactions.toArray()
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }))

    all.forEach(t => {
      const date = new Date(t.date)
      const m = date.getMonth()
      if (date.getFullYear() === year) {
        if (t.type === 'income') months[m].income += t.amount
        else if (t.type === 'expense') months[m].expense += t.amount
      }
    })

    return months
  },

  async search(query) {
    const all = await db.transactions.toArray()
    return all.filter(t =>
      t.description?.toLowerCase().includes(query.toLowerCase()) ||
      t.category?.toLowerCase().includes(query.toLowerCase())
    )
  },
}
