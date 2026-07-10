export const WALLET_TYPES = [
  { value: 'cash', label: 'پول نقد', icon: 'Banknote' },
  { value: 'card', label: 'کارت بانکی', icon: 'CreditCard' },
  { value: 'bank', label: 'حساب بانکی', icon: 'Landmark' },
  { value: 'fund', label: 'صندوق', icon: 'Vault' },
  { value: 'digital', label: 'کیف پول دیجیتال', icon: 'Smartphone' },
]

export const TRANSACTION_TYPES = [
  { value: 'income', label: 'درآمد', color: '#10b981' },
  { value: 'expense', label: 'هزینه', color: '#ef4444' },
  { value: 'transfer', label: 'انتقال', color: '#3b82f6' },
]

export const BUDGET_TYPES = [
  { value: 'personal', label: 'بودجه شخصی' },
  { value: 'store', label: 'بودجه فروشگاه' },
  { value: 'installment', label: 'قسط' },
  { value: 'check', label: 'چک' },
  { value: 'loan', label: 'وام' },
  { value: 'purchase', label: 'خرید' },
  { value: 'project', label: 'پروژه' },
]

export const CHECK_STATUSES = [
  { value: 'pending', label: 'وصول نشده', color: '#f59e0b' },
  { value: 'cleared', label: 'وصول شده', color: '#10b981' },
  { value: 'returned', label: 'برگشتی', color: '#ef4444' },
]

export const LOAN_STATUSES = [
  { value: 'active', label: 'فعال' },
  { value: 'paid', label: 'پرداخت شده' },
  { value: 'overdue', label: 'معوق' },
]

export const CATEGORIES = {
  income: [
    { value: 'salary', label: 'حقوق' },
    { value: 'freelance', label: 'فریلنسری' },
    { value: 'investment', label: 'سرمایه‌گذاری' },
    { value: 'gift', label: 'هدیه' },
    { value: 'rental', label: 'اجاره' },
    { value: 'other_income', label: 'سایر درآمدها' },
  ],
  expense: [
    { value: 'food', label: 'خوراک' },
    { value: 'transport', label: 'حمل و نقل' },
    { value: 'housing', label: 'مسکن' },
    { value: 'utilities', label: 'قبوض' },
    { value: 'health', label: 'سلامت' },
    { value: 'education', label: 'آموزش' },
    { value: 'entertainment', label: 'سرگرمی' },
    { value: 'shopping', label: 'خرید' },
    { value: 'insurance', label: 'بیمه' },
    { value: 'other_expense', label: 'سایر هزینه‌ها' },
  ],
}

export function getCategoryLabel(type, value) {
  if (!type || !value) return value || ''
  if (value === 'transfer') return 'انتقال'
  const cats = CATEGORIES[type] || []
  const found = cats.find(c => c.value === value)
  return found?.label || value
}

export const COLORS = [
  '#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
  '#06b6d4', '#d946ef', '#0ea5e9', '#e11d48', '#65a30d',
]
