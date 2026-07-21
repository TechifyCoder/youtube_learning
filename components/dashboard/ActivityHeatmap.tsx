'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { GlassCard } from '@/components/common/GlassCard'
import { subDays, format, startOfWeek, addDays, getDay } from 'date-fns'

interface ActivityLog {
  date: string
  minutesWatched: number
  videosWatched: number
}

// 52 weeks * 7 days = 364 days
const TOTAL_DAYS = 364

export function ActivityHeatmap() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<string>('yearly')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle outside click for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    async function fetchActivity() {
      try {
        const res = await fetch(`/api/activity?days=${TOTAL_DAYS}`)
        if (res.ok) {
          const data = await res.json()
          setLogs(data)
        }
      } catch (err) {
        console.error('Failed to fetch activity logs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchActivity()
  }, [])

  const { grid, monthLabels, availableMonths } = useMemo(() => {
    const today = new Date()
    const startDate = subDays(today, TOTAL_DAYS - 1)
    
    const days: { date: Date; log?: ActivityLog }[] = []
    const logMap = new Map(logs.map(log => [log.date, log]))
    
    const availableMonthOptions: { label: string; value: string }[] = []
    const monthsSet = new Set<string>()

    for (let i = 0; i < TOTAL_DAYS; i++) {
      const d = addDays(startDate, i)
      const dateStr = d.toISOString().split('T')[0]!
      
      const monthKey = format(d, 'yyyy-MM')
      if (!monthsSet.has(monthKey)) {
        monthsSet.add(monthKey)
        availableMonthOptions.push({ label: format(d, 'MMMM yyyy'), value: monthKey })
      }

      days.push({
        date: d,
        log: logMap.get(dateStr),
      })
    }

    const weeks: typeof days[] = []
    let currentWeek: typeof days = []
    
    const startDayOfWeek = getDay(startDate)
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({ date: subDays(startDate, startDayOfWeek - i) })
    }

    days.forEach(day => {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    })

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const lastDate = currentWeek[currentWeek.length - 1]!.date
        currentWeek.push({ date: addDays(lastDate, 1) })
      }
      weeks.push(currentWeek)
    }

    let finalWeeks = weeks
    if (viewMode !== 'yearly') {
      finalWeeks = weeks.filter(week => 
        week.some(day => format(day.date, 'yyyy-MM') === viewMode)
      )
    }

    const labels: { month: string; colIndex: number }[] = []
    let currentMonth = -1
    finalWeeks.forEach((week, index) => {
      const targetDay = viewMode !== 'yearly' 
        ? week.find(d => format(d.date, 'yyyy-MM') === viewMode) || week[0]!
        : week[0]!
        
      const month = targetDay.date.getMonth()
      if (month !== currentMonth) {
        labels.push({ month: format(targetDay.date, 'MMM'), colIndex: index })
        currentMonth = month
      }
    })

    return { 
      grid: finalWeeks, 
      monthLabels: labels, 
      availableMonths: availableMonthOptions.reverse() 
    }
  }, [logs, viewMode])

  // Auto-scroll to the rightmost edge to show the current active month (similar to GitHub)
  useEffect(() => {
    if (!loading && scrollContainerRef.current) {
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth
        }
      })
    }
  }, [loading, grid, viewMode])

  const getColorClass = (minutes: number) => {
    if (minutes === 0) return 'bg-white/[0.04]'
    if (minutes <= 20) return 'bg-purple-900/60'
    if (minutes <= 45) return 'bg-purple-600/70'
    if (minutes <= 60) return 'bg-purple-500'
    return 'bg-purple-400'
  }

  return (
    <GlassCard padding="md" variant="subtle" className="w-full overflow-hidden relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-4">
          <h3 className="font-heading font-semibold text-lg text-[--text-primary]">
            Learning Activity
          </h3>
          
          {/* Custom Dark Theme Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between gap-2 w-36 bg-black/20 border border-white/10 rounded-md text-xs px-3 py-1.5 text-[--text-secondary] outline-none hover:border-purple-500/50 transition-colors"
            >
              <span className="truncate">
                {viewMode === 'yearly' ? 'Last Year' : availableMonths.find(m => m.value === viewMode)?.label}
              </span>
              <svg className={`w-3 h-3 opacity-50 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-[#1A1228] border border-white/10 rounded-md shadow-2xl overflow-hidden z-50 py-1">
                <button
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 transition-colors ${viewMode === 'yearly' ? 'text-purple-400 bg-purple-500/10 font-medium' : 'text-[--text-secondary]'}`}
                  onClick={() => { setViewMode('yearly'); setIsDropdownOpen(false); }}
                >
                  Last Year
                </button>
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                  {availableMonths.map(m => (
                    <button
                      key={m.value}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 transition-colors ${viewMode === m.value ? 'text-purple-400 bg-purple-500/10 font-medium' : 'text-[--text-secondary]'}`}
                      onClick={() => { setViewMode(m.value); setIsDropdownOpen(false); }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
        <div className="flex items-center gap-2 text-xs text-[--text-secondary]">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-white/[0.04]" />
          <div className="w-2.5 h-2.5 rounded-sm bg-purple-900/60" />
          <div className="w-2.5 h-2.5 rounded-sm bg-purple-600/70" />
          <div className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
          <div className="w-2.5 h-2.5 rounded-sm bg-purple-400" />
          <span>More</span>
        </div>
      </div>

      <div ref={scrollContainerRef} className="w-full overflow-x-auto pb-4 custom-scrollbar">
        <div className={viewMode === 'yearly' ? 'min-w-[800px]' : 'min-w-fit'}>
          {/* Month labels */}
          <div className="flex relative h-5 mb-1 ml-6 text-xs text-[--text-secondary]">
            {monthLabels.map(({ month, colIndex }) => (
              <div
                key={`${month}-${colIndex}`}
                className="absolute"
                style={{ left: `${colIndex * 14}px` }}
              >
                {month}
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Day labels (Mon, Wed, Fri) */}
            <div className="flex flex-col gap-[4px] mr-2 text-[10px] text-[--text-secondary] pt-1">
              <div className="h-2.5"></div>
              <div className="h-2.5 flex items-center">Mon</div>
              <div className="h-2.5"></div>
              <div className="h-2.5 flex items-center">Wed</div>
              <div className="h-2.5"></div>
              <div className="h-2.5 flex items-center">Fri</div>
              <div className="h-2.5"></div>
            </div>

            {/* Grid */}
            <div className="flex gap-[4px]">
              {grid.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-[4px]">
                  {week.map((day, dIndex) => {
                    const minutes = day.log?.minutesWatched || 0
                    const title = day.log 
                      ? `${format(day.date, 'MMM d, yyyy')} — ${minutes} min watched`
                      : `${format(day.date, 'MMM d, yyyy')} — No activity`
                    
                    // Don't render cells for dates in the future
                    const isFuture = day.date > new Date()

                    return (
                      <div
                        key={`${wIndex}-${dIndex}`}
                        title={title}
                        className={`w-2.5 h-2.5 rounded-sm transition-colors duration-200 ${
                          isFuture ? 'bg-transparent' : getColorClass(minutes)
                        }`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
