import { create } from 'zustand'
import { emergencyRepository } from '../database/repositories/emergencyRepository'

export const useEmergencyStore = create((set, get) => ({
  emergency: null,
  loading: false,

  loadEmergency: async () => {
    set({ loading: true })
    const emergency = await emergencyRepository.get()
    set({ emergency, loading: false })
  },

  saveEmergency: async (data) => {
    await emergencyRepository.save(data)
    await get().loadEmergency()
  },

  deleteEmergency: async () => {
    await emergencyRepository.delete()
    set({ emergency: null })
  },

  calculate: async (balance, endDate) => {
    return emergencyRepository.calculate(balance, endDate)
  },
}))
