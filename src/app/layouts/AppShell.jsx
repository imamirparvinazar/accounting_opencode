import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { BottomNav } from './BottomNav'
import { useWalletStore } from '../../stores/walletStore'

export function AppShell() {
  const loadWallets = useWalletStore(s => s.loadWallets)

  useEffect(() => {
    loadWallets()
  }, [loadWallets])

  return (
    <div className="min-h-screen bg-bg-page">
      <main className="max-w-lg mx-auto pb-20 px-4 pt-4">
        <Outlet />
      </main>
      <BottomNav />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            direction: 'rtl',
          },
        }}
      />
    </div>
  )
}
