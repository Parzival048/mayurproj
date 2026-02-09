import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
                secondary: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300',
                success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                outline: 'border border-stone-300 text-stone-700 dark:border-stone-600 dark:text-stone-300',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <span className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
