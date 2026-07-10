import { db } from '../schema/db'

export const budgetRepository = {
  async getAll() {
    return db.budgets.orderBy('createdAt').reverse().toArray()
  },

  async getById(id) {
    return db.budgets.get(id)
  },

  async getActive() {
    const now = Date.now()
    return db.budgets
      .where('endDate')
      .aboveOrEqual(now)
      .filter(b => b.status !== 'completed')
      .toArray()
  },

  async create(budget) {
    return db.budgets.add({
      ...budget,
      paidAmount: 0,
      status: 'active',
      createdAt: Date.now(),
    })
  },

  async update(id, data) {
    return db.budgets.update(id, data)
  },

  async delete(id) {
    await db.budgetPayments.where('budgetId').equals(id).delete()
    return db.budgets.delete(id)
  },

  async addPayment(budgetId, amount, date) {
    const paymentId = await db.budgetPayments.add({
      budgetId,
      amount,
      date,
      createdAt: Date.now(),
    })
    const payments = await db.budgetPayments.where('budgetId').equals(budgetId).toArray()
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    const budget = await db.budgets.get(budgetId)
    const status = totalPaid >= budget.amount ? 'completed' : 'active'
    await db.budgets.update(budgetId, { paidAmount: totalPaid, status })
    return paymentId
  },
}
