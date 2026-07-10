import { db } from '../schema/db'

export const emergencyRepository = {
  async get() {
    return db.emergency.orderBy('id').reverse().first()
  },

  async getByWalletId(walletId) {
    return db.emergency.where('walletId').equals(walletId).first()
  },

  async save(data) {
    const existing = await db.emergency.orderBy('id').reverse().first()
    if (existing) {
      await db.emergency.update(existing.id, data)
      return existing.id
    }
    return db.emergency.add(data)
  },

  async delete() {
    const existing = await db.emergency.orderBy('id').reverse().first()
    if (existing) {
      return db.emergency.delete(existing.id)
    }
  },

  async calculate(walletBalance, endDate) {
    const now = Date.now()
    const end = new Date(endDate).getTime()
    const daysRemaining = Math.max(1, Math.ceil((end - now) / (1000 * 60 * 60 * 24)))
    const dailyLimit = Math.floor(walletBalance / daysRemaining)
    return { dailyLimit, daysRemaining }
  },

  async getTodayExpenses(walletId) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const transactions = await db.transactions
      .where({ walletId, type: 'expense' })
      .filter(t => {
        const d = new Date(t.date)
        return d >= today && d < tomorrow
      })
      .toArray()
    return transactions.reduce((sum, t) => sum + t.amount, 0)
  },

  async checkTransaction(walletId, amount) {
    const emergency = await this.getByWalletId(walletId)
    if (!emergency) return null
    const todaySpent = await this.getTodayExpenses(walletId)
    const remaining = emergency.dailyLimit - todaySpent
    const daysConsumed = amount > 0 ? Math.ceil(amount / Math.max(1, emergency.dailyLimit)) : 0
    return {
      dailyLimit: emergency.dailyLimit,
      todaySpent,
      remaining,
      amount,
      withinLimit: amount <= remaining,
      daysConsumed: amount > remaining ? Math.ceil((amount - remaining) / Math.max(1, emergency.dailyLimit)) + 1 : 1,
    }
  },
}
