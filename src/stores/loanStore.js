import { create } from 'zustand'
import { loanRepository } from '../database/repositories/loanRepository'

export const useLoanStore = create((set, get) => ({
  loans: [],
  loading: false,

  loadLoans: async () => {
    set({ loading: true })
    const loans = await loanRepository.getAll()
    set({ loans, loading: false })
  },

  addLoan: async (loan) => {
    await loanRepository.create(loan)
    await get().loadLoans()
  },

  updateLoan: async (id, data) => {
    await loanRepository.update(id, data)
    await get().loadLoans()
  },

  deleteLoan: async (id) => {
    await loanRepository.delete(id)
    await get().loadLoans()
  },

  addPayment: async (loanId, amount, date, installmentNumber) => {
    await loanRepository.addPayment(loanId, amount, date, installmentNumber)
    await get().loadLoans()
  },
}))
