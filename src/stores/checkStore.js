import { create } from 'zustand'
import { checkRepository } from '../database/repositories/checkRepository'

export const useCheckStore = create((set, get) => ({
  checks: [],
  loading: false,

  loadChecks: async () => {
    set({ loading: true })
    const checks = await checkRepository.getAll()
    set({ checks, loading: false })
  },

  addCheck: async (check) => {
    await checkRepository.create(check)
    await get().loadChecks()
  },

  updateCheck: async (id, data) => {
    await checkRepository.update(id, data)
    await get().loadChecks()
  },

  deleteCheck: async (id) => {
    await checkRepository.delete(id)
    await get().loadChecks()
  },
}))
