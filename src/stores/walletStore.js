import { create } from 'zustand'
import { walletRepository } from '../database/repositories/walletRepository'

export const useWalletStore = create((set, get) => ({
  wallets: [],
  defaultWallet: null,
  loading: false,

  loadWallets: async () => {
    set({ loading: true })
    const wallets = await walletRepository.getAll()
    const defaultWallet = wallets.find(w => w.isDefault) || wallets[0] || null
    set({ wallets, defaultWallet, loading: false })
  },

  addWallet: async (wallet) => {
    await walletRepository.create(wallet)
    await get().loadWallets()
  },

  updateWallet: async (id, data) => {
    await walletRepository.update(id, data)
    await get().loadWallets()
  },

  deleteWallet: async (id) => {
    await walletRepository.delete(id)
    await get().loadWallets()
  },

  setDefault: async (id) => {
    await walletRepository.setDefault(id)
    await get().loadWallets()
  },

  getBalance: async (id) => {
    return walletRepository.getBalance(id)
  },
}))
