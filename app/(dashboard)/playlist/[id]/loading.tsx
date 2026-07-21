import { Skeleton } from '@/components/ui/skeleton'
import { GlassCard } from '@/components/common/GlassCard'

export default function PlaylistLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <GlassCard padding="lg" className="flex flex-col md:flex-row gap-6 items-start">
        <Skeleton className="w-full md:w-[280px] aspect-video rounded-xl" />
        <div className="flex-1 space-y-4 w-full">
          <Skeleton className="w-3/4 h-8" />
          <Skeleton className="w-1/2 h-5" />
          <div className="flex gap-4 mt-6">
            <Skeleton className="w-32 h-10" />
            <Skeleton className="w-32 h-10" />
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/[0.05] pb-px">
        <Skeleton className="w-24 h-10" />
        <Skeleton className="w-24 h-10" />
      </div>

      {/* Content */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <GlassCard key={i} padding="sm" className="flex items-center gap-4">
            <Skeleton className="w-5 h-5 rounded-full shrink-0 ml-1" />
            <Skeleton className="w-[120px] aspect-video shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-3/4 h-5" />
              <Skeleton className="w-1/2 h-4" />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
