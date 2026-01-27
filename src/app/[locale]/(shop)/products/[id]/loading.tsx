import { Skeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
       <div className="grid md:grid-cols-2 gap-12">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    </div>
  )
}
