import { db } from '../schema/db'

export const walletRepository = {
  async getAll() {
    return db.wallets.orderBy('createdAt').reverse().toArray()
  },

  async getById(id) {
    return db.wallets.get(id)
  },

  async getDefault() {
    const wallet = await db.wallets.where('isDefault').equals(1).first()
    return wallet || null
  },

  async create(wallet) {
    const id = await db.wallets.add({
      ...wallet,
      createdAt: Date.now(),
      isDefault: wallet.isDefault ? 1 : 0,
    })
    if (wallet.isDefault) {
      await db.wallets.where('id').notEqual(id).modify({ isDefault: 0 })
    }
    return id
  },

  async update(id, data) {
    if (data.isDefault) {
      await db.wallets.where('id').notEqual(id).modify({ isDefault: 0 })
    }
    return db.wallets.update(id, { ...data, isDefault: data.isDefault ? 1 : 0 })
  },

  async delete(id) {
    await db.transactions.where('walletId').equals(id).delete()
    return db.wallets.delete(id)
  },

  async setDefault(id) {
    await db.wallets.where('id').notEqual(id).modify({ isDefault: 0 })
    return db.wallets.update(id, { isDefault: 1 })
  },

  async getBalance(id) {
    const incomes = await db.transactions
      .where({ walletId: id, type: 'income' })
      .toArray()
    const expenses = await db.transactions
      .where({ walletId: id, type: 'expense' })
      .toArray()

    const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0)
    return totalIncome - totalExpense
  },
}
