import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../layouts/AppShell'
import { MoreMenu } from '../layouts/MoreMenu'
import Dashboard from '../../features/dashboard/DashboardPage'
import Transactions from '../../features/transactions/TransactionsPage'
import TransactionWizard from '../../features/transactions/TransactionWizard'
import TransactionDetail from '../../features/transactions/TransactionDetail'
import Wallets from '../../features/wallets/WalletsPage'
import WalletForm from '../../features/wallets/WalletForm'
import Budgets from '../../features/budgets/BudgetsPage'
import BudgetForm from '../../features/budgets/BudgetForm'
import Loans from '../../features/loans/LoansPage'
import LoanForm from '../../features/loans/LoanForm'
import Checks from '../../features/checks/ChecksPage'
import CheckForm from '../../features/checks/CheckForm'
import Emergency from '../../features/emergency/EmergencyPage'
import Settings from '../../features/settings/SettingsPage'
import StoreDashboard from '../../features/store/StoreDashboard'
import StoreProducts from '../../features/store/StoreProducts'
import StoreProductForm from '../../features/store/StoreProductForm'
import StoreInvoices from '../../features/store/StoreInvoices'
import StoreInvoiceForm from '../../features/store/StoreInvoiceForm'
import StoreInstallments from '../../features/store/StoreInstallments'
import { StoreLayout } from '../../features/store/StoreLayout'

const Reports = lazy(() => import('../../features/reports/ReportsPage'))
const StoreReports = lazy(() => import('../../features/store/StoreReports'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'transactions', element: <Transactions /> },
      { path: 'transactions/new', element: <TransactionWizard /> },
      { path: 'transactions/:id', element: <TransactionDetail /> },
      { path: 'wallets', element: <Wallets /> },
      { path: 'wallets/new', element: <WalletForm /> },
      { path: 'wallets/edit/:id', element: <WalletForm /> },
      { path: 'budgets', element: <Budgets /> },
      { path: 'budgets/new', element: <BudgetForm /> },
      { path: 'budgets/edit/:id', element: <BudgetForm /> },
      { path: 'loans', element: <Loans /> },
      { path: 'loans/new', element: <LoanForm /> },
      { path: 'loans/edit/:id', element: <LoanForm /> },
      { path: 'checks', element: <Checks /> },
      { path: 'checks/new', element: <CheckForm /> },
      { path: 'checks/edit/:id', element: <CheckForm /> },
      { path: 'reports', element: <Reports /> },
      { path: 'emergency', element: <Emergency /> },
      { path: 'settings', element: <Settings /> },
      { path: 'more', element: <MoreMenu /> },
    ],
  },
  {
    path: '/store',
    element: <StoreLayout />,
    children: [
      { index: true, element: <StoreDashboard /> },
      { path: 'products', element: <StoreProducts /> },
      { path: 'products/new', element: <StoreProductForm /> },
      { path: 'products/edit/:id', element: <StoreProductForm /> },
      { path: 'invoices', element: <StoreInvoices /> },
      { path: 'invoices/new', element: <StoreInvoiceForm /> },
      { path: 'installments', element: <StoreInstallments /> },
      { path: 'reports', element: <StoreReports /> },
    ],
  },
])
