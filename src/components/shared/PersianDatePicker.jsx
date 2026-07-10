import { useState, useMemo, forwardRef } from 'react'
import dayjs from 'dayjs'
import jalaliday from 'jalaliday'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '../../utils/cn'

dayjs.extend(jalaliday)

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
const monthNames = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]
const weekdayNames = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

function toPersianNum(n) {
  return String(n).replace(/\d/g, d => persianDigits[+d])
}

function toISODate(jDate) {
  return jDate.calendar('gregorian').format('YYYY-MM-DD')
}

function fromISODate(iso) {
  if (!iso) return null
  return dayjs(iso).calendar('jalali')
}

export function PersianDatePicker({ value, onChange, className }) {
  const [show, setShow] = useState(false)
  const initialJ = fromISODate(value) || dayjs().calendar('jalali')
  const [viewYear, setViewYear] = useState(initialJ.year())
  const [viewMonth, setViewMonth] = useState(initialJ.month() + 1)

  const displayText = value ? toPersianNum(fromISODate(value).format('YYYY/MM/DD')) : ''

  const daysGrid = useMemo(() => {
    const firstDay = dayjs().calendar('jalali').year(viewYear).month(viewMonth - 1).date(1)
    const startDow = firstDay.day()
    const daysInMonth = firstDay.daysInMonth()
    const grid = []
    let week = []
    for (let i = 0; i < startDow; i++) week.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(d)
      if (week.length === 7) {
        grid.push(week)
        week = []
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null)
      grid.push(week)
    }
    return grid
  }, [viewYear, viewMonth])

  const selectDay = (d) => {
    if (!d) return
    const jDate = dayjs().calendar('jalali').year(viewYear).month(viewMonth - 1).date(d)
    onChange(toISODate(jDate))
    setShow(false)
  }

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1) }
    else setViewMonth(m => m + 1)
  }

  return (
    <>
      <div
        onClick={() => setShow(true)}
        className={cn(
          'w-full h-12 px-4 bg-gray-50 rounded-xl border border-gray-200 text-sm flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/30',
          !value && 'text-gray-400',
          className
        )}
      >
        {displayText || 'انتخاب تاریخ'}
      </div>

      {show && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShow(false)} />
          <div className="relative z-50 w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-gray-100">
                <ChevronRight size={20} className="text-gray-600" />
              </button>
              <span className="text-sm font-bold text-gray-900">
                {toPersianNum(viewYear)} {monthNames[viewMonth - 1]}
              </span>
              <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-gray-100">
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekdayNames.map(d => (
                <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {daysGrid.flat().map((d, i) => {
                if (!d) return <div key={i} />
                const jDate = dayjs().calendar('jalali').year(viewYear).month(viewMonth - 1).date(d)
                const iso = toISODate(jDate)
                const isSelected = iso === value
                return (
                  <button
                    key={i}
                    onClick={() => selectDay(d)}
                    className={cn(
                      'h-9 rounded-lg text-sm font-medium transition-colors',
                      isSelected ? 'bg-accent text-white' : 'text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    {toPersianNum(d)}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setShow(false)}
              className="w-full mt-4 py-2.5 bg-gray-100 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
            >
              انصراف
            </button>
          </div>
        </div>
      )}
    </>
  )
}
