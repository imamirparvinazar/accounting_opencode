import { db } from '../schema/db'

export const settingsRepository = {
  async get(key) {
    const setting = await db.settings.where('key').equals(key).first()
    return setting ? setting.value : null
  },

  async set(key, value) {
    const existing = await db.settings.where('key').equals(key).first()
    if (existing) {
      return db.settings.update(existing.id, { value })
    }
    return db.settings.add({ key, value })
  },

  async getAll() {
    const settings = await db.settings.toArray()
    const map = {}
    settings.forEach(s => { map[s.key] = s.value })
    return map
  },

  async exportAll() {
    const wallets = await db.wallets.toArray()
    const transactions = await db.transactions.toArray()
    const budgets = await db.budgets.toArray()
    const loans = await db.loans.toArray()
    const checks = await db.checks.toArray()
    const settings = await db.settings.toArray()
    return { wallets, transactions, budgets, loans, checks, settings, exportedAt: new Date().toISOString() }
  },

  async importAll(data) {
    await db.wallets.clear()
    await db.transactions.clear()
    await db.budgets.clear()
    await db.loans.clear()
    await db.checks.clear()
    await db.settings.clear()

    if (data.wallets) await db.wallets.bulkAdd(data.wallets)
    if (data.transactions) await db.transactions.bulkAdd(data.transactions)
    if (data.budgets) await db.budgets.bulkAdd(data.budgets)
    if (data.loans) await db.loans.bulkAdd(data.loans)
    if (data.checks) await db.checks.bulkAdd(data.checks)
    if (data.settings) await db.settings.bulkAdd(data.settings)
  },
}
