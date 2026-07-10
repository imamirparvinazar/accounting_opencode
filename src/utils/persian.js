import dayjs from 'dayjs'
import jalaliday from 'jalaliday'

dayjs.extend(jalaliday)

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toPersianNumber(num) {
  return String(num).replace(/\d/g, d => persianDigits[+d])
}

export function formatWithSeparator(n) {
  const parts = String(Math.abs(n)).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '٬')
  return (n < 0 ? '−' : '') + parts.join('.')
}

export function toPersianDate(date, format = 'YYYY/MM/DD') {
  const formatted = dayjs(date).calendar('jalali').format(format)
  return toPersianNumber(formatted)
}

export function formatCurrency(amount, currency = 'تومان') {
  const formatted = formatWithSeparator(Math.round(Math.abs(amount)))
  const persianFormatted = toPersianNumber(formatted)
  const sign = amount < 0 ? '−' : ''
  return `${sign}${persianFormatted} ${currency}`
}

export function getPersianMonthName(month) {
  const names = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
  ]
  return names[month] || ''
}

export function getCurrentPersianYear() {
  return dayjs().calendar('jalali').year()
}

export function getCurrentPersianMonth() {
  return dayjs().calendar('jalali').month() + 1
}
