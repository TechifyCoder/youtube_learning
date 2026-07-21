import { Skeleton } from '@/components/ui/skeleton'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { GlassCard } from '@/components/common/GlassCard'

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <Skeleton className="w-48 h-10 mb-2" />
        <Skeleton className="w-64 h-5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2">
          <Skeleton className="w-full h-[120px]" />
        </div>
        <div className="col-span-1">
          <Skeleton className="w-full h-[120px]" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="w-32 h-8 mt-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <GlassCard key={i} padding="none" className="flex h-[200px]">
              <Skeleton className="w-48 h-full rounded-r-none" />
              <div className="p-4 flex-1 space-y-4">
                <Skeleton className="w-full h-6" />
                <Skeleton className="w-3/4 h-6" />
                <div className="mt-auto space-y-2">
                  <Skeleton className="w-full h-2" />
                  <Skeleton className="w-12 h-2" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  )
}
