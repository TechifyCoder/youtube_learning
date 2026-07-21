'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { memo } from 'react'

interface MonthlyActivityChartProps {
  data: {
    name: string
    hours: number
  }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-md border border-white/[0.1] px-3 py-2 rounded-lg text-sm text-white shadow-xl">
        <p className="font-medium">{label}</p>
        <p className="text-purple-400 font-bold">{payload[0].value} hours</p>
      </div>
    )
  }
  return null
}

export const MonthlyActivityChart = memo(function MonthlyActivityChart({ data }: MonthlyActivityChartProps) {
  if (!data || data.length === 0) return null

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
            tickFormatter={(value) => `${value}h`}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
            content={<CustomTooltip />} 
          />
          <Bar 
            dataKey="hours" 
            fill="#8b5cf6" // purple-500
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
})
