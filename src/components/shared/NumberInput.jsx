import { forwardRef, useCallback } from 'react'
import { cn } from '../../utils/cn'

function cleanNumber(str) {
  if (!str && str !== 0) return ''
  const persian = '۰۱۲۳۴۵۶۷۸۹'
  return String(str)
    .replace(/[۰-۹]/g, d => persian.indexOf(d))
    .replace(/[^0-9.]/g, '')
}

function formatDisplay(str) {
  if (!str && str !== 0) return ''
  const cleaned = cleanNumber(String(str))
  if (!cleaned) return ''
  const parts = cleaned.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '٬')
  const persianParts = parts.map(p => p.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d]))
  return persianParts.join('.')
}

function digitPositionToCursor(formatted, digitPos) {
  let count = 0
  for (let i = 0; i < formatted.length; i++) {
    if (count >= digitPos) return i
    const c = formatted.charCodeAt(i)
    if (c >= 0x06f0 && c <= 0x06f9) count++
  }
  return formatted.length
}

const NumberInput = forwardRef(({ className, value, placeholder, dir = 'ltr', ...rest }, ref) => {
  const isControlled = value !== undefined

  const handleChange = useCallback((e) => {
    const raw = e.target.value
    const numeric = cleanNumber(raw)

    if (!isControlled) {
      const start = e.target.selectionStart
      const digitsBefore = raw.slice(0, start || 0).replace(/[^0-9۰-۹]/g, '').length
      const formatted = formatDisplay(numeric)
      if (e.target.value !== formatted) {
        e.target.value = formatted
        e.target.setSelectionRange(
          digitPositionToCursor(formatted, digitsBefore),
          digitPositionToCursor(formatted, digitsBefore)
        )
      }
    }

    const extOnChange = rest.onChange
    if (extOnChange) {
      extOnChange({ ...e, target: { ...e.target, value: numeric } })
    }
  }, [isControlled, rest.onChange])

  const { onChange: _omitOnChange, ...spreadable } = rest

  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      {...(isControlled ? { value: formatDisplay(value) } : {})}
      onChange={handleChange}
      placeholder={placeholder}
      dir={dir}
      className={cn(
        'w-full h-12 px-4 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30',
        className
      )}
      {...spreadable}
    />
  )
})

NumberInput.displayName = 'NumberInput'
export default NumberInput
