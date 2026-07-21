'use client'

import { useEffect, useState, useMemo } from 'react'
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

  const { grid, monthLabels } = useMemo(() => {
    const today = new Date()
    // Find the start date (364 days ago)
    const startDate = subDays(today, TOTAL_DAYS - 1)
    
    // We want the grid to start on a Sunday (or whatever startOfWeek gives)
    // To keep it simple, we just build an array of dates from startDate to today
    const days: { date: Date; log?: ActivityLog }[] = []
    
    // Create a map for quick lookup
    const logMap = new Map(logs.map(log => [log.date, log]))

    for (let i = 0; i < TOTAL_DAYS; i++) {
      const d = addDays(startDate, i)
      const dateStr = d.toISOString().split('T')[0]!
      days.push({
        date: d,
        log: logMap.get(dateStr),
      })
    }

    // Group into weeks (columns)
    const weeks: typeof days[] = []
    let currentWeek: typeof days = []
    
    // To align properly, we might need empty slots at the beginning if startDate is not Sunday
    const startDayOfWeek = getDay(startDate)
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({ date: subDays(startDate, startDayOfWeek - i) }) // padding
    }

    days.forEach(day => {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    })

    if (currentWeek.length > 0) {
      // pad the end if necessary
      while (currentWeek.length < 7) {
        const lastDate = currentWeek[currentWeek.length - 1]!.date
        currentWeek.push({ date: addDays(lastDate, 1) })
      }
      weeks.push(currentWeek)
    }

    // Generate month labels
    const labels: { month: string; colIndex: number }[] = []
    let currentMonth = -1
    weeks.forEach((week, index) => {
      // Use the first day of the week to determine the month
      const month = week[0]!.date.getMonth()
      if (month !== currentMonth) {
        labels.push({ month: format(week[0]!.date, 'MMM'), colIndex: index })
        currentMonth = month
      }
    })

    return { grid: weeks, monthLabels: labels }
  }, [logs])

  const getColorClass = (minutes: number) => {
    if (minutes === 0) return 'bg-white/[0.04]'
    if (minutes <= 20) return 'bg-purple-900/60'
    if (minutes <= 45) return 'bg-purple-600/70'
    if (minutes <= 60) return 'bg-purple-500'
    return 'bg-purple-400'
  }

  return (
    <GlassCard padding="md" variant="subtle" className="w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-lg text-[--text-primary]">
          Learning Activity
        </h3>
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

      <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
        <div className="min-w-[800px]">
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
