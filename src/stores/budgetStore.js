import { create } from 'zustand'
import { budgetRepository } from '../database/repositories/budgetRepository'

export const useBudgetStore = create((set, get) => ({
  budgets: [],
  activeBudgets: [],
  loading: false,

  loadBudgets: async () => {
    set({ loading: true })
    const budgets = await budgetRepository.getAll()
    const activeBudgets = budgets.filter(b =>
      b.status === 'active' && b.endDate >= Date.now()
    )
    set({ budgets, activeBudgets, loading: false })
  },

  addBudget: async (budget) => {
    await budgetRepository.create(budget)
    await get().loadBudgets()
  },

  updateBudget: async (id, data) => {
    await budgetRepository.update(id, data)
    await get().loadBudgets()
  },

  deleteBudget: async (id) => {
    await budgetRepository.delete(id)
    await get().loadBudgets()
  },

  addPayment: async (budgetId, amount, date) => {
    await budgetRepository.addPayment(budgetId, amount, date)
    await get().loadBudgets()
  },
}))
