import { db } from '../schema/db'

export const storeInstallmentRepository = {
  async getAll() {
    return db.storeInstallments.orderBy('createdAt').reverse().toArray()
  },

  async getById(id) {
    return db.storeInstallments.get(id)
  },

  async create(data) {
    return db.storeInstallments.add({
      ...data,
      paidAmount: 0,
      status: 'active',
      createdAt: Date.now(),
    })
  },

  async update(id, data) {
    return db.storeInstallments.update(id, data)
  },

  async delete(id) {
    return db.storeInstallments.delete(id)
  },

  async addPayment(id, amount) {
    const inst = await db.storeInstallments.get(id)
    if (!inst) return
    const paidAmount = (inst.paidAmount || 0) + amount
    const status = paidAmount >= inst.totalAmount ? 'paid' : 'active'
    return db.storeInstallments.update(id, { paidAmount, status })
  },
}
