import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, icon, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-stone-400">{icon}</span>
                        </div>
                    )}
                    <input
                        type={type}
                        id={inputId}
                        className={cn(
                            'flex h-11 w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition-all duration-200',
                            'placeholder:text-stone-400',
                            'focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20',
                            'disabled:cursor-not-allowed disabled:bg-stone-50 disabled:opacity-50',
                            'dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500',
                            'dark:focus:border-amber-400 dark:focus:ring-amber-400/20',
                            icon && 'pl-10',
                            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-red-500">{error}</p>
                )}
            </div>
        )
    }
)
Input.displayName = 'Input'

export { Input }
