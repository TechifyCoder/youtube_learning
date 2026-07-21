import { Skeleton } from '@/components/ui/skeleton'
import { GlassCard } from '@/components/common/GlassCard'

export default function WatchLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-pulse">
      
      {/* Left Column: Player & Details */}
      <div className="lg:col-span-2 space-y-6">
        <div className="space-y-4">
          <Skeleton className="w-full aspect-video rounded-xl" />
          <Skeleton className="w-full h-2 rounded-full" />
        </div>

        <GlassCard padding="lg" variant="elevated">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4 flex-1 w-full">
              <Skeleton className="w-3/4 h-8" />
              <div className="flex gap-4">
                <Skeleton className="w-20 h-5" />
                <Skeleton className="w-32 h-5" />
              </div>
            </div>
            <Skeleton className="w-32 h-10 shrink-0" />
          </div>
        </GlassCard>
      </div>

      {/* Right Column: AI Chat */}
      <div className="lg:col-span-1 hidden lg:block">
        <div className="sticky top-6">
          <GlassCard padding="none" className="flex flex-col h-[600px]">
            <div className="p-4 border-b border-white/[0.05] flex gap-3">
              <Skeleton className="w-8 h-8 rounded" />
              <div className="space-y-2">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-32 h-3" />
              </div>
            </div>
            <div className="flex-1 p-4 space-y-4">
              <Skeleton className="w-3/4 h-16 rounded-2xl rounded-bl-sm" />
              <Skeleton className="w-3/4 h-12 rounded-2xl rounded-br-sm ml-auto" />
              <Skeleton className="w-3/4 h-24 rounded-2xl rounded-bl-sm" />
            </div>
            <div className="p-3 border-t border-white/[0.05]">
              <Skeleton className="w-full h-10 rounded-full" />
            </div>
          </GlassCard>
        </div>
      </div>

    </div>
  )
}
