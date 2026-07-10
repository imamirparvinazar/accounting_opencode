import { create } from 'zustand'
import { settingsRepository } from '../database/repositories/settingsRepository'

export const useSettingsStore = create((set, get) => ({
  settings: {},
  loading: false,

  loadSettings: async () => {
    set({ loading: true })
    const settings = await settingsRepository.getAll()
    set({ settings, loading: false })
  },

  setSetting: async (key, value) => {
    await settingsRepository.set(key, value)
    set(state => ({ settings: { ...state.settings, [key]: value } }))
  },

  getSetting: (key, defaultValue = null) => {
    return get().settings[key] ?? defaultValue
  },

  exportData: async () => {
    return settingsRepository.exportAll()
  },

  importData: async (data) => {
    await settingsRepository.importAll(data)
    await get().loadSettings()
  },
}))
