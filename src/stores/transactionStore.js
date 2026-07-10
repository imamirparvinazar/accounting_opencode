import { create } from 'zustand'
import { transactionRepository } from '../database/repositories/transactionRepository'

export const useTransactionStore = create((set, get) => ({
  transactions: [],
  recentTransactions: [],
  loading: false,

  loadTransactions: async () => {
    set({ loading: true })
    const transactions = await transactionRepository.getAll()
    set({ transactions, loading: false })
  },

  loadRecent: async (limit = 5) => {
    const recentTransactions = await transactionRepository.getRecent(limit)
    set({ recentTransactions })
  },

  addTransaction: async (transaction) => {
    await transactionRepository.create(transaction)
    await get().loadTransactions()
    await get().loadRecent()
  },

  updateTransaction: async (id, data) => {
    await transactionRepository.update(id, data)
    await get().loadTransactions()
  },

  deleteTransaction: async (id) => {
    await transactionRepository.delete(id)
    await get().loadTransactions()
  },

  getByWallet: async (walletId) => {
    return transactionRepository.getByWallet(walletId)
  },
}))
