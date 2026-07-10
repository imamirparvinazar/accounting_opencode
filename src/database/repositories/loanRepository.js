import { db } from '../schema/db'

export const loanRepository = {
  async getAll() {
    return db.loans.orderBy('createdAt').reverse().toArray()
  },

  async getById(id) {
    return db.loans.get(id)
  },

  async create(loan) {
    return db.loans.add({
      ...loan,
      paidAmount: 0,
      status: 'active',
      createdAt: Date.now(),
    })
  },

  async update(id, data) {
    return db.loans.update(id, data)
  },

  async delete(id) {
    await db.loanPayments.where('loanId').equals(id).delete()
    return db.loans.delete(id)
  },

  async addPayment(loanId, amount, date, installmentNumber) {
    const paymentId = await db.loanPayments.add({
      loanId, amount, date, installmentNumber, createdAt: Date.now(),
    })
    const payments = await db.loanPayments.where('loanId').equals(loanId).toArray()
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    const loan = await db.loans.get(loanId)
    const status = totalPaid >= loan.amount ? 'paid' : 'active'
    await db.loans.update(loanId, { paidAmount: totalPaid, status })
    return paymentId
  },

  async getPayments(loanId) {
    return db.loanPayments.where('loanId').equals(loanId).toArray()
  },
}
