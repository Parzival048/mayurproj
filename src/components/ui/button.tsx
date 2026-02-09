import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
    {
        variants: {
            variant: {
                default:
                    'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-500/25 hover:from-amber-700 hover:to-amber-600',
                secondary:
                    'bg-stone-100 text-stone-900 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700',
                outline:
                    'border-2 border-amber-600 text-amber-600 hover:bg-amber-50 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-950',
                ghost:
                    'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800',
                destructive:
                    'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/25',
                link:
                    'text-amber-600 underline-offset-4 hover:underline dark:text-amber-400',
            },
            size: {
                default: 'h-11 px-6 py-2',
                sm: 'h-9 px-4 text-xs',
                lg: 'h-12 px-8 text-base',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {children}
            </button>
        )
    }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
