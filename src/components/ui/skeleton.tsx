import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    animate?: boolean
}

function Skeleton({ className, animate = true, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                'rounded-lg bg-stone-200 dark:bg-stone-800',
                animate && 'animate-pulse',
                className
            )}
            {...props}
        />
    )
}

function ProductCardSkeleton() {
    return (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="mt-4 h-6 w-1/3" />
            </div>
        </div>
    )
}

function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    )
}

function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
    return (
        <tr className="border-b border-stone-100 dark:border-stone-800">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-4">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    )
}

export { Skeleton, ProductCardSkeleton, ProductGridSkeleton, TableRowSkeleton }
